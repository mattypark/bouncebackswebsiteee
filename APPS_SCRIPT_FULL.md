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
- `sendPaymentReminders` (timer-driven payment follow-up, sent via Resend)
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
// No minimum wait — fire on the next timer run after signup. Cap at
// 7 days so we don't email very old unpaid rows.
const REMINDER_MIN_MS = 0;
const REMINDER_MAX_MS = 7 * 24 * 60 * 60 * 1000;

// Outbound mail goes through Resend (same verified domain the backend
// contact form uses: bouncebackpickle.com). The API key is NOT hardcoded —
// set it once in Apps Script → Project Settings (gear) → Script Properties:
//   RESEND_API_KEY = re_xxxxxxxx
// `recycle@bouncebackpickle.com` is the verified Resend sender. Replies route
// to Dillon's inbox so "reply for a fresh link" lands somewhere real.
const RESEND_API_URL    = 'https://api.resend.com/emails';
const REMINDER_FROM     = 'Dillon Rosenthal <recycle@bouncebackpickle.com>';
const REMINDER_REPLY_TO = 'Bouncebackpickle@gmail.com';

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
 * Fires on the next timer run after signup (no minimum wait), up to 7 days
 * out. Marks col AA so they only get one reminder.
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

    const name = firstName || 'there';
    const subject = 'You\'re one step away, ' + name;

    // Plain text fallback for clients that strip HTML.
    const body =
      'Hey ' + name + ',\n\n' +
      'This is Dillon from BounceBack Pickle. Thank you so much for looking into joining the BounceBack Sustainable Facility Program.\n\n' +
      'Things here are moving fast. We\'re scaling across the US and working to turn the country\'s fastest-growing sport into its first sustainable one.\n\n' +
      'I noticed you filled out most of the form, but didn\'t finish the final step. We\'d love to have you. As a member, you\'ll get the Sustainable Facility Accreditation along with discounted pricing on the world\'s first recycled pickleball, inclusion in our marketing network, and the satisfaction of helping keep pickleball plastic out of landfills.\n\n' +
      'You can finish your membership here:\n\n' +
      url + '\n\n' +
      'Heads up: the link is active for 24 hours. If it expires, reply, and I\'ll send you a fresh one.\n\n' +
      'Any questions, reach out anytime. Excited to have you in the movement.\n\n' +
      'Best,\n' +
      'Dillon Rosenthal\n' +
      'Founder, BounceBack Pickle\n' +
      'www.bouncebackpickle.com';

    // HTML version — table-based for Gmail/Outlook compatibility.
    const htmlBody =
      '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px 16px;">' +
        '<p style="margin:0 0 16px 0;">Hey ' + name + ',</p>' +
        '<p style="margin:0 0 16px 0;">This is Dillon from BounceBack Pickle. Thank you so much for looking into joining the BounceBack Sustainable Facility Program.</p>' +
        '<p style="margin:0 0 16px 0;">Things here are moving fast. We\'re scaling across the US and working to turn the country\'s fastest-growing sport into its first sustainable one.</p>' +
        '<p style="margin:0 0 16px 0;">I noticed you filled out most of the form, but didn\'t finish the final step. We\'d love to have you. As a member, you\'ll get the Sustainable Facility Accreditation along with discounted pricing on the world\'s first recycled pickleball, inclusion in our marketing network, and the satisfaction of helping keep pickleball plastic out of landfills.</p>' +
        '<p style="margin:0 0 20px 0;">You can finish your membership here:</p>' +
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">' +
          '<tr><td style="border-radius:6px;background-color:#084734;">' +
            '<a href="' + url + '" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;letter-spacing:0.04em;color:#FBFFF1;text-decoration:none;border-radius:6px;">Finish your membership</a>' +
          '</td></tr>' +
        '</table>' +
        '<p style="margin:0 0 16px 0;color:#555;font-size:13px;">Or paste this link into your browser:<br><a href="' + url + '" style="color:#084734;word-break:break-all;">' + url + '</a></p>' +
        '<p style="margin:0 0 16px 0;">Heads up: the link is active for 24 hours. If it expires, reply, and I\'ll send you a fresh one.</p>' +
        '<p style="margin:0 0 24px 0;">Any questions, reach out anytime. Excited to have you in the movement.</p>' +
        '<p style="margin:0;">Best,<br>' +
          '<strong>Dillon Rosenthal</strong><br>' +
          'Founder, BounceBack Pickle<br>' +
          '<a href="https://www.bouncebackpickle.com" style="color:#084734;text-decoration:none;">www.bouncebackpickle.com</a>' +
        '</p>' +
      '</div>';

    const RESEND_API_KEY = PropertiesService.getScriptProperties().getProperty('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('[BounceBack] RESEND_API_KEY not set in Script Properties — cannot send reminders.');
      return;
    }

    try {
      const response = UrlFetchApp.fetch(RESEND_API_URL, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + RESEND_API_KEY },
        payload: JSON.stringify({
          from:     REMINDER_FROM,
          to:       [email],
          reply_to: REMINDER_REPLY_TO,
          subject:  subject,
          text:     body,
          html:     htmlBody,
        }),
        muteHttpExceptions: true,
      });

      const code = response.getResponseCode();
      const respBody = response.getContentText();

      if (code >= 200 && code < 300) {
        withRetry(
          () => sheet.getRange(i + 1, COL.paymentReminderSent).setValue(new Date()),
          'sendPaymentReminders:setReminderSent'
        );
        console.log('[BounceBack] Reminder sent to', email, 'row', i + 1);
      } else {
        // Don't mark AA — the row stays eligible and retries next run.
        console.error('[BounceBack] Resend rejected row', i + 1, '—', code + ':', respBody);
      }
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
