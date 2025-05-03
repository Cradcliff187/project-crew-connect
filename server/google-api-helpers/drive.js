const { google } = require('googleapis');

// Task 3: Reusable helper module for Google Drive

/**
 * Initializes the Google Drive API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.drive_v3.Drive} - Google Drive API client instance.
 */
function getDriveClient(authClient) {
  return google.drive({ version: 'v3', auth: authClient });
}

/**
 * Lists files in Google Drive.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {object} options - Options for listing files (e.g., pageSize, fields, q, orderBy).
 * @returns {Promise<object>} - The API response data.
 */
async function listFiles(authClient, options = {}) {
  const drive = getDriveClient(authClient);
  const defaultOptions = {
    pageSize: 10,
    fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)',
  };
  const listParams = { ...defaultOptions, ...options };

  console.log('Listing Drive files with params:', listParams);
  const response = await drive.files.list(listParams);
  console.log('Drive files.list response status:', response.status);
  return response.data;
}

// Add more Drive helper functions as needed (e.g., uploadFile, getFile, etc.)

module.exports = {
  getDriveClient,
  listFiles,
};
