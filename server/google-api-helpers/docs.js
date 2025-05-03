const { google } = require('googleapis');

// Task 3: Reusable helper module for Google Docs

/**
 * Initializes the Google Docs API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.docs_v1.Docs} - Google Docs API client instance.
 */
function getDocsClient(authClient) {
  return google.docs({ version: 'v1', auth: authClient });
}

// Note: Listing documents is typically done via the Drive API.
// Add specific Docs helper functions here as needed (e.g., getDocument, createDocument, updateDocument).

module.exports = {
  getDocsClient,
};
