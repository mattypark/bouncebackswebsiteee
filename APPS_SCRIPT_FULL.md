# BounceBack — Full Apps Script (copy/paste)

**Instructions**: Open the Google Sheet → Extensions → Apps Script → select all
existing code (Cmd+A) → delete → paste the block below → Cmd+S to save →
Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy.

This file is the **single source of truth** for the entire Apps Script. It
includes:

- `WEBHOOK_URL`, `API_KEY`, `COL` constants
- `withRetry` helper that retries Google Sheets calls on transient INTERNAL
  errors (the "We're sorry, a server error occurred while reading from storage"
  bug that occasionally hits both timers and `doPost`)
- `checkForNewSubscribers` (existing timer-driven function that forwards
  `subscribed` rows to the shipping backend)
- `sendPaymentReminders` (timer-driven Gmail follow-up)
- `WEBSITE_MIN_ROW` constant for website-driven rows
- `doPost` handling all 6 actions from the website + Stripe pipeline
- `doGet` health check

> If you ever rotate the `API_KEY`, update the value on the first line below
> before pasting.

```javascript
const WEBHOOK_URL = 'https://bounceback-shipping-production.up.railway.app/admin/facilities/from-form';
const API_KEY = 'xyz';

const COL = {
  timestamp:            1,
  firstName:            2,
  lastName:             3,
  phone:                4,
  email:                14,
  facilityName:         6,
  streetAddress:        7,
  city:                 8,
  state:                9,
  zip:                  10,
  paymentLink:          15,  // O — HYPERLINK to Stripe Checkout
  payableStatus:        18,
  email1Sent:           22,
  paymentReminderSent:  27,  // AA — set when reminder email goes out
};

// Time window for the payment reminder.
// Don't email before 5 minutes (they may still be on Stripe) or after
// 24 hours (avoid spamming people who decided not to join days later).
const REMINDER_MIN_MS = 5  * 60 * 1000;
const REMINDER_MAX_MS = 24 * 60 * 60 * 1000;

// Email identity for outbound mail. The script owner must have this
// address configured as a "Send mail as" alias in their Gmail settings
// (gmail.com → ⚙ → See all settings → Accounts → Send mail as → Add
// another email address). Otherwise GmailApp will fall back to the
// script owner's address.
const REMINDER_FROM_EMAIL = 'bouncebackpickle@gmail.com';
const REMINDER_FROM_NAME  = 'BounceBack Pickle';

// ───────────────────────────────────────────────────────────────────────
// Retry wrapper for transient Google Sheets / Apps Script storage errors.
//
// Google occasionally throws "We're sorry, a server error occurred while
// reading from storage. Error code INTERNAL." on perfectly valid calls.
// It's a known transient issue. Retrying 2x with backoff fixes ~99% of them.
//
// Usage:
//   const sheet = withRetry(() => SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(), 'getSheet');
//   const data  = withRetry(() => sheet.getDataRange().getValues(), 'getValues');
//   withRetry(() => sheet.getRange(row, col).setValue(val), 'setValue');
// ───────────────────────────────────────────────────────────────────────
function withRetry(fn, label, maxAttempts) {
  const attempts = maxAttempts || 3;          // 1 try + 2 retries
  let lastErr = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return fn();
    } catch (err) {
      lastErr = err;
      const msg = (err && err.message) ? err.message : String(err);
      const transient =
        msg.indexOf('INTERNAL')                   !== -1 ||
        msg.indexOf('reading from storage')       !== -1 ||
        msg.indexOf('Service unavailable')        !== -1 ||
        msg.indexOf('Service Spreadsheets failed')!== -1 ||
        msg.indexOf('try again')                  !== -1 ||
        msg.indexOf('temporarily unavailable')    !== -1;

      if (!transient || attempt === attempts) {
        console.error('[BounceBack] withRetry(' + label + ') failed attempt ' + attempt + '/' + attempts + ':', msg);
        throw err;
      }

      // Exponential backoff: 500ms, 1500ms.
      const wait = 500 * Math.pow(3, attempt - 1);
      console.log('[BounceBack] withRetry(' + label + ') transient error attempt ' + attempt + '/' + attempts + ' — sleeping ' + wait + 'ms:', msg);
      Utilities.sleep(wait);
    }
  }
  throw lastErr;
}

function checkForNewSubscribers() {
  const sheet = withRetry(
    () => SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(),
    'checkForNewSubscribers:getSheet'
  );
  const data = withRetry(
    () => sheet.getDataRange().getValues(),
    'checkForNewSubscribers:getValues'
  );

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const status = (row[COL.payableStatus - 1] || '').toString().trim().toLowerCase();
    const alreadySent = row[COL.email1Sent - 1];

    if (status !== 'subscribed') continue;
    if (alreadySent) continue;

    const payload = {
      firstName:     row[COL.firstName - 1],
      lastName:      row[COL.lastName - 1],
      email:         row[COL.email - 1],
      phone:         row[COL.phone - 1],
      facilityName:  row[COL.facilityName - 1],
      streetAddress: row[COL.streetAddress - 1],
      city:          row[COL.city - 1],
      state:         row[COL.state - 1],
      zip:           row[COL.zip - 1],
    };

    if (!payload.email || !payload.facilityName) {
      console.log('[BounceBack] Missing email or facility name, skipping row', i + 1);
      continue;
    }

    try {
      const response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-api-key': API_KEY },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      const code = response.getResponseCode();
      const body = response.getContentText();
      console.log(`[BounceBack] Row ${i + 1} response ${code}:`, body);

      if (code === 200) {
        withRetry(
          () => sheet.getRange(i + 1, COL.email1Sent).setValue(new Date()),
          'checkForNewSubscribers:setEmail1Sent'
        );
        console.log(`[BounceBack] Success — facility created for row ${i + 1}`);
      } else {
        console.error(`[BounceBack] Failed row ${i + 1} — ${code}: ${body}`);
      }
    } catch (err) {
      console.error('[BounceBack] Request error row', i + 1, ':', err.message);
    }
  }
}

/**
 * Sends a follow-up email with the Stripe payment link to anyone who got
 * a link generated (col O) but hasn't paid yet (col R != "subscribed").
 * Only fires 5 min – 24 hr after they signed up. Marks col AA so they
 * only get one reminder.
 *
 * Set up a time-driven trigger to run this every 5 minutes:
 *   Apps Script editor → Triggers (clock icon) → Add Trigger →
 *   Function: sendPaymentReminders → Event: Time-driven →
 *   Type: Minutes timer → Every 5 minutes → Save.
 */
function sendPaymentReminders() {
  const sheet = withRetry(
    () => SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(),
    'sendPaymentReminders:getSheet'
  );
  const data = withRetry(
    () => sheet.getDataRange().getValues(),
    'sendPaymentReminders:getValues'
  );
  const now = Date.now();

  for (let i = 1; i < data.length; i++) {
    const row             = data[i];
    const email           = (row[COL.email - 1] || '').toString().trim();
    const status          = (row[COL.payableStatus - 1] || '').toString().trim().toLowerCase();
    const paymentLinkCell = row[COL.paymentLink - 1];
    const timestamp       = row[COL.timestamp - 1];
    const reminderSent    = row[COL.paymentReminderSent - 1];
    const firstName       = (row[COL.firstName - 1] || '').toString().trim();
    const facilityName    = (row[COL.facilityName - 1] || '').toString().trim();

    if (!email) continue;
    if (status === 'subscribed') continue;
    if (!paymentLinkCell) continue;
    if (reminderSent) continue;
    if (!(timestamp instanceof Date)) continue;

    const elapsed = now - timestamp.getTime();
    if (elapsed < REMINDER_MIN_MS) continue;
    if (elapsed > REMINDER_MAX_MS) continue;

    // Pull the real URL out of the HYPERLINK formula in col O.
    const formula = withRetry(
      () => sheet.getRange(i + 1, COL.paymentLink).getFormula(),
      'sendPaymentReminders:getFormula'
    );
    let url = '';
    if (formula) {
      const match = formula.match(/HYPERLINK\(\s*"([^"]+)"/);
      if (match) url = match[1];
    } else {
      url = paymentLinkCell.toString();
    }
    if (!url) continue;

    const subject = 'Finish your BounceBack Sustainable Facility enrollment';
    const greeting = 'Hey ' + (firstName || 'there') + ',';

    // Plain text fallback for clients that strip HTML.
    const body =
      greeting + '\n\n' +
      'You made it through our Sustainable Facility Program form, which tells me you\'re serious about making your facility more sustainable, so I don\'t want anything to get in the way of that.\n\n' +
      'If you have any questions before completing your enrollment, I\'m happy to help over the phone or email. Here\'s what you get as a Sustainable Facility Partner:\n\n' +
      '- Branded recycling bin shipped to your facility\n' +
      '- Sustainable Facility Accreditation Certificate\n' +
      '- Certified sustainable marketing rights\n' +
      '- Listed on the BounceBack partner directory\n' +
      '- First access + exclusive pricing on the world\'s first 100% recycled pickleball\n\n' +
      'All for just $150/year — join a growing network of facilities making America\'s fastest-growing sport sustainable.\n\n' +
      'If you\'re ready to lock it in, here\'s your link: ' + url + '\n\n' +
      'Just reply here and I\'ll get back to you same day.\n\n' +
      'Talk soon,\n' +
      'Dillon Rosenthal\n' +
      'Founder, BounceBack Pickle\n' +
      '941-806-7933';

    // HTML version — table-based for Gmail/Outlook compatibility.
    const htmlBody =
      '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px 16px;">' +
        '<p style="margin:0 0 16px 0;">' + greeting + '</p>' +
        '<p style="margin:0 0 16px 0;">You made it through our Sustainable Facility Program form, which tells me you\'re serious about making your facility more sustainable, so I don\'t want anything to get in the way of that.</p>' +
        '<p style="margin:0 0 12px 0;">If you have any questions before completing your enrollment, I\'m happy to help over the phone or email. Here\'s what you get as a Sustainable Facility Partner:</p>' +
        '<ul style="margin:0 0 16px 0;padding-left:22px;">' +
          '<li style="margin:0 0 6px 0;">Branded recycling bin shipped to your facility</li>' +
          '<li style="margin:0 0 6px 0;">Sustainable Facility Accreditation Certificate</li>' +
          '<li style="margin:0 0 6px 0;">Certified sustainable marketing rights</li>' +
          '<li style="margin:0 0 6px 0;">Listed on the BounceBack partner directory</li>' +
          '<li style="margin:0 0 0 0;">First access + exclusive pricing on the world\'s first 100% recycled pickleball</li>' +
        '</ul>' +
        '<p style="margin:0 0 24px 0;">All for just <strong>$150/year</strong> — join a growing network of facilities making America\'s fastest-growing sport sustainable.</p>' +
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;">' +
          '<tr><td style="border-radius:6px;background-color:#084734;">' +
            '<a href="' + url + '" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;letter-spacing:0.04em;color:#FBFFF1;text-decoration:none;border-radius:6px;">Complete enrollment</a>' +
          '</td></tr>' +
        '</table>' +
        '<p style="margin:0 0 16px 0;color:#555;font-size:13px;">Or paste this link into your browser:<br><a href="' + url + '" style="color:#084734;word-break:break-all;">' + url + '</a></p>' +
        '<p style="margin:0 0 24px 0;">Just reply here and I\'ll get back to you same day.</p>' +
        '<p style="margin:0;">Talk soon,<br>' +
          '<strong>Dillon Rosenthal</strong><br>' +
          'Founder, BounceBack Pickle<br>' +
          '<a href="tel:+19418067933" style="color:#084734;text-decoration:none;">941-806-7933</a>' +
        '</p>' +
      '</div>';

    try {
      // GmailApp lets us set `from` to a configured send-as alias so the
      // recipient sees bouncebackpickle@gmail.com — not the script owner.
      GmailApp.sendEmail(email, subject, body, {
        from:     REMINDER_FROM_EMAIL,
        name:     REMINDER_FROM_NAME,
        replyTo:  REMINDER_FROM_EMAIL,
        htmlBody: htmlBody,
      });
      withRetry(
        () => sheet.getRange(i + 1, COL.paymentReminderSent).setValue(new Date()),
        'sendPaymentReminders:setReminderSent'
      );
      console.log('[BounceBack] Reminder sent to', email, 'row', i + 1);
    } catch (err) {
      console.error('[BounceBack] Reminder failed row', i + 1, ':', err.message);
    }
  }
}

// Website rows append directly after the last filled row (no gap).
const WEBSITE_MIN_ROW = 2;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = withRetry(
      () => SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(),
      'doPost:getSheet'
    );
    const action = data.action;

    if (action === 'facility') {
      const lastRow = withRetry(() => sheet.getLastRow(), 'doPost:facility:getLastRow');
      const targetRow = Math.max(lastRow + 1, WEBSITE_MIN_ROW);

      withRetry(() => sheet.getRange(targetRow, 1 ).setValue(new Date()),                  'doPost:facility:A');  // A  Timestamp
      withRetry(() => sheet.getRange(targetRow, 2 ).setValue(data.firstName     || ''),    'doPost:facility:B');  // B  First Name
      withRetry(() => sheet.getRange(targetRow, 3 ).setValue(data.lastName      || ''),    'doPost:facility:C');  // C  Last Name
      withRetry(() => sheet.getRange(targetRow, 4 ).setValue(data.phone         || ''),    'doPost:facility:D');  // D  Phone
      withRetry(() => sheet.getRange(targetRow, 6 ).setValue(data.facilityName  || ''),    'doPost:facility:F');  // F  Facility Name
      withRetry(() => sheet.getRange(targetRow, 7 ).setValue(data.streetAddress || ''),    'doPost:facility:G');  // G  Street
      withRetry(() => sheet.getRange(targetRow, 8 ).setValue(data.city          || ''),    'doPost:facility:H');  // H  City
      withRetry(() => sheet.getRange(targetRow, 9 ).setValue(data.state         || ''),    'doPost:facility:I');  // I  State
      withRetry(() => sheet.getRange(targetRow, 10).setValue(data.zipCode       || ''),    'doPost:facility:J');  // J  Zip
      withRetry(() => sheet.getRange(targetRow, 14).setValue(data.email         || ''),    'doPost:facility:N');  // N  Email

      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, rowNumber: targetRow }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'program') {
      const rowNumber = parseInt(data.rowNumber, 10);
      if (!rowNumber || rowNumber < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'invalid rowNumber' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      withRetry(() => sheet.getRange(rowNumber, 11).setValue(data.additionalBins || ''),           'doPost:program:K');  // K  Additional bins
      withRetry(() => sheet.getRange(rowNumber, 12).setValue(data.agreedTerms   ? 'Yes' : 'No'),   'doPost:program:L');  // L  Agreed Terms
      withRetry(() => sheet.getRange(rowNumber, 13).setValue(data.agreedUpdates ? 'Yes' : 'No'),   'doPost:program:M');  // M  Wants Updates
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'checkout-started') {
      const rowNumber = parseInt(data.rowNumber, 10);
      if (!rowNumber || rowNumber < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'invalid rowNumber' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      withRetry(() => sheet.getRange(rowNumber, 18).setValue('checkout-started'), 'doPost:checkout-started:R');  // R  Payable Status
      withRetry(() => sheet.getRange(rowNumber, 21).setValue(new Date()),         'doPost:checkout-started:U');  // U  Payable Last Update
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'subscribed') {
      const rowNumber = parseInt(data.rowNumber, 10);
      if (!rowNumber || rowNumber < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'invalid rowNumber' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (data.orderId) {
        withRetry(() => sheet.getRange(rowNumber, 16).setValue(data.orderId), 'doPost:subscribed:P');           // P  Order ID
      }
      if (data.total != null) {
        withRetry(() => sheet.getRange(rowNumber, 17).setValue(data.total / 100), 'doPost:subscribed:Q');       // Q  Total ($)
      }
      withRetry(() => sheet.getRange(rowNumber, 18).setValue('subscribed'), 'doPost:subscribed:R');             // R  Payable Status
      withRetry(() => sheet.getRange(rowNumber, 21).setValue(new Date()),   'doPost:subscribed:U');             // U  Payable Last Update
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'save-payment-link') {
      const rowNumber = parseInt(data.rowNumber, 10);
      if (!rowNumber || rowNumber < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'invalid rowNumber' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const url = (data.paymentUrl || '').toString().replace(/"/g, '');
      const label = (data.paymentLabel || 'Pay link').toString().replace(/"/g, '');
      if (url) {
        withRetry(
          () => sheet.getRange(rowNumber, 15).setFormula('=HYPERLINK("' + url + '","' + label + '")'),
          'doPost:save-payment-link:O-formula'
        );
      } else {
        withRetry(
          () => sheet.getRange(rowNumber, 15).setValue(''),
          'doPost:save-payment-link:O-clear'
        );
      }
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'checkout-canceled') {
      const rowNumber = parseInt(data.rowNumber, 10);
      if (!rowNumber || rowNumber < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'invalid rowNumber' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      // Clear "checkout-started" so the row doesn't look like they paid.
      withRetry(() => sheet.getRange(rowNumber, 18).setValue(''),         'doPost:checkout-canceled:R');  // R  Payable Status
      withRetry(() => sheet.getRange(rowNumber, 21).setValue(new Date()), 'doPost:checkout-canceled:U');  // U  Payable Last Update
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: 'unknown action: ' + action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('BounceBack website webhook is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## Column reference

| Col | # | Field |
|---|---|---|
| A | 1 | Timestamp |
| B | 2 | First Name |
| C | 3 | Last Name |
| D | 4 | Phone |
| E | 5 | (unused) |
| F | 6 | Facility Name |
| G | 7 | Street Address |
| H | 8 | City |
| I | 9 | State |
| J | 10 | Zip |
| K | 11 | Additional Bins |
| L | 12 | Agreed Terms |
| M | 13 | Wants Updates |
| N | 14 | Email |
| O | 15 | To join — click below (Stripe URL) |
| P | 16 | Payable Order ID |
| Q | 17 | Payable Total |
| R | 18 | Payable Status |
| S | 19 | Payable Payment Method |
| T | 20 | Payable Transaction |
| U | 21 | Payable Last Update |
| V | 22 | 1st email sent |
| W | 23 | 2nd email sent |
| X | 24 | 3rd email sent |
| Y | 25 | Envelope |
| Z | 26 | Bins |
| AA | 27 | Payment reminder sent |
