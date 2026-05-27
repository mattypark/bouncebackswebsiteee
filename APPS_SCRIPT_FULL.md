# BounceBack — Full Apps Script (copy/paste)

**Instructions**: Open the Google Sheet → Extensions → Apps Script → select all
existing code (Cmd+A) → delete → paste the block below → Cmd+S to save →
Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy.

This file is the **single source of truth** for the entire Apps Script. It
includes:

- `WEBHOOK_URL`, `API_KEY`, `COL` constants
- `checkForNewSubscribers` (existing timer-driven function that forwards
  `subscribed` rows to the shipping backend)
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

function checkForNewSubscribers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = sheet.getDataRange().getValues();

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
        sheet.getRange(i + 1, COL.email1Sent).setValue(new Date());
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = sheet.getDataRange().getValues();
  const now   = Date.now();

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
    const formula = sheet.getRange(i + 1, COL.paymentLink).getFormula();
    let url = '';
    if (formula) {
      const match = formula.match(/HYPERLINK\(\s*"([^"]+)"/);
      if (match) url = match[1];
    } else {
      url = paymentLinkCell.toString();
    }
    if (!url) continue;

    const subject = 'Finish your BounceBack Pickle membership';
    const body =
      'Hi ' + (firstName || 'there') + ',\n\n' +
      'Thanks for starting your Sustainable Facility Accreditation Membership' +
      (facilityName ? ' for ' + facilityName : '') + '. ' +
      'It looks like checkout didn\'t finish on your end.\n\n' +
      'Pick up where you left off here:\n' + url + '\n\n' +
      'Reply to this email if you have any questions or hit a snag.\n\n' +
      'The BounceBack Pickle Team';

    try {
      MailApp.sendEmail({ to: email, subject: subject, body: body });
      sheet.getRange(i + 1, COL.paymentReminderSent).setValue(new Date());
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const action = data.action;

    if (action === 'facility') {
      const lastRow = sheet.getLastRow();
      const targetRow = Math.max(lastRow + 1, WEBSITE_MIN_ROW);

      sheet.getRange(targetRow, 1 ).setValue(new Date());                  // A  Timestamp
      sheet.getRange(targetRow, 2 ).setValue(data.firstName     || '');    // B  First Name
      sheet.getRange(targetRow, 3 ).setValue(data.lastName      || '');    // C  Last Name
      sheet.getRange(targetRow, 4 ).setValue(data.phone         || '');    // D  Phone
      sheet.getRange(targetRow, 6 ).setValue(data.facilityName  || '');    // F  Facility Name
      sheet.getRange(targetRow, 7 ).setValue(data.streetAddress || '');    // G  Street
      sheet.getRange(targetRow, 8 ).setValue(data.city          || '');    // H  City
      sheet.getRange(targetRow, 9 ).setValue(data.state         || '');    // I  State
      sheet.getRange(targetRow, 10).setValue(data.zipCode       || '');    // J  Zip
      sheet.getRange(targetRow, 14).setValue(data.email         || '');    // N  Email

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
      sheet.getRange(rowNumber, 11).setValue(data.additionalBins || '');           // K  Additional bins
      sheet.getRange(rowNumber, 12).setValue(data.agreedTerms   ? 'Yes' : 'No');   // L  Agreed Terms
      sheet.getRange(rowNumber, 13).setValue(data.agreedUpdates ? 'Yes' : 'No');   // M  Wants Updates
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
      sheet.getRange(rowNumber, 18).setValue('checkout-started');                  // R  Payable Status
      sheet.getRange(rowNumber, 21).setValue(new Date());                          // U  Payable Last Update
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
      if (data.orderId) sheet.getRange(rowNumber, 16).setValue(data.orderId);      // P  Order ID
      if (data.total != null) {
        sheet.getRange(rowNumber, 17).setValue(data.total / 100);                  // Q  Total ($)
      }
      sheet.getRange(rowNumber, 18).setValue('subscribed');                        // R  Payable Status
      sheet.getRange(rowNumber, 21).setValue(new Date());                          // U  Payable Last Update
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
        sheet.getRange(rowNumber, 15).setFormula('=HYPERLINK("' + url + '","' + label + '")'); // O  To join — click below
      } else {
        sheet.getRange(rowNumber, 15).setValue('');
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
      sheet.getRange(rowNumber, 18).setValue('');                                  // R  Payable Status
      sheet.getRange(rowNumber, 21).setValue(new Date());                          // U  Payable Last Update
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
