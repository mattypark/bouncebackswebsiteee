# BounceBack — Google Apps Script Webhook

Paste this into the Google Sheet's Apps Script project (**Extensions → Apps Script**),
**after** the existing `checkForNewSubscribers` function. Don't delete anything that's
already there — `WEBHOOK_URL`, `API_KEY`, `COL`, and `checkForNewSubscribers` all stay.

## What it does

The website (`bouncebackpickle.com/request-bin`) POSTs to this script's web app URL
at three points in the form flow:

| Action sent from website | Sheet effect |
|---|---|
| `action: "facility"` (after Step 2) | Appends a new row right after the last existing row, fills cols A, B, C, D, F, G, H, I, J, N. Returns `{rowNumber}` so we can update that exact row later. |
| `action: "program"` (after Step 3) | Updates cols K, L, M on the row returned above (additional bins / agreed terms / wants updates). Fixes the bug where those fields weren't being captured. |
| `action: "checkout-started"` (when they click Pay) | Sets col R = `"checkout-started"` and col U = now. |
| `action: "subscribed"` (Stripe webhook on `checkout.session.completed`) | Sets col R = `"subscribed"`, col P = Stripe session ID, col Q = total cents, col U = now. The existing `checkForNewSubscribers` timer picks this up and fires the email pipeline. |
| `action: "save-payment-link"` (Stripe checkout backend, after session created) | Writes the Stripe Checkout URL to col O (`To join — click below`) so Dillon can copy/send it manually to facilities that didn't finish paying. |
| `action: "checkout-canceled"` (frontend, after Stripe cancel redirect) | Clears col R back to empty so a canceled checkout doesn't look like a started payment. |

Website rows append directly after the last filled row (no gap), so the
spreadsheet stays continuous.

## The code

```javascript
/**
 * Website webhook — receives submissions from bouncebackpickle.com/request-bin.
 * Two actions:
 *   action: "facility"  → append a new row, fill cols A,B,C,D,F,G,H,I,J,N. Returns { rowNumber }.
 *   action: "program"   → update cols K,L,M on the row returned above.
 * Website rows append at lastRow+1 (right after Google Form responses).
 */
// Website rows append directly after the last form row (no gap).
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
      sheet.getRange(rowNumber, 15).setValue(data.paymentUrl || '');               // O  To join — click below
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

## Deploy steps

1. **Save** the script (Cmd+S).
2. **Deploy → Manage deployments** (not "New deployment" if one already exists).
   - Existing deployment: click ✏️ → version: **New version** → **Deploy**. Same URL stays valid.
   - First time: **New deployment** → gear ⚙ → **Web app** → Execute as **Me**, Who has access **Anyone** → **Deploy**.
3. **Authorize** when Google prompts (Advanced → Go to project (unsafe) → Allow).
4. **Copy the Web app URL** (the one ending in `/exec`).
5. Quick check: paste the URL in a browser, you should see:
   ```
   BounceBack website webhook is live.
   ```

## Column reference

For sanity — this is the column layout the script writes to:

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
| O | 15 | To join — click below |
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
