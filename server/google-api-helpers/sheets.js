const { google } = require('googleapis');

// Task 3: Reusable helper module for Google Sheets

/**
 * Initializes the Google Sheets API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.sheets_v4.Sheets} - Google Sheets API client instance.
 */
function getSheetsClient(authClient) {
  return google.sheets({ version: 'v4', auth: authClient });
}

// Note: Listing spreadsheets is typically done via the Drive API.
// Add specific Sheets helper functions here as needed (e.g., getSpreadsheetData, updateSpreadsheetData).

module.exports = {
  getSheetsClient,
};
