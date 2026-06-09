# Fix: Apps Script Gmail Permission Error

The `sendPaymentReminders` function fails with:
> "The script does not have permission to perform that action. Required permissions: gmail.modify"

## Steps to fix

1. Open the Google Sheet: **BounceBack Pickle Recycling Program - Facility Sign-Up (Responses)**
2. Go to **Extensions → Apps Script** (opens "auto admin portal")
3. Click the **gear icon** (Project Settings) in the left sidebar
4. Check **"Show 'appsscript.json' manifest file in editor"**
5. Click the **code icon** (`< >`) to go back to the Editor
6. Click the **appsscript.json** file in the file list
7. Replace its entire contents with:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

8. **Cmd+S** to save
9. Click back to **Code.gs**
10. Select **`sendPaymentReminders`** from the function dropdown (top toolbar)
11. Click **Run** (play button)
12. Google will pop up **"Authorization required"**:
    - Click **Review Permissions**
    - Choose your Google account
    - Click **Advanced** → **Go to auto admin portal (unsafe)**
    - Click **Allow**
13. Check the Execution log — should show reminders sending successfully

## If you previously removed access

If you went to https://myaccount.google.com/permissions and removed access for
"auto admin portal", that's fine — step 11 above will re-grant all permissions
with the correct Gmail scopes.

## Why this happened

The script was originally authorized with only Sheets + basic email permissions.
`GmailApp.sendEmail()` with the `from` alias option requires the full
`https://mail.google.com/` OAuth scope. Adding it to `appsscript.json` forces
Google to re-prompt for the broader permission.
