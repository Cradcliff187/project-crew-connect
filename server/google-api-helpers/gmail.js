const { google } = require('googleapis');

// Task 3: Reusable helper module for Google Gmail

/**
 * Initializes the Google Gmail API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.gmail_v1.Gmail} - Google Gmail API client instance.
 */
function getGmailClient(authClient) {
  return google.gmail({ version: 'v1', auth: authClient });
}

/**
 * Lists messages in the user's mailbox.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {object} options - Options for listing messages (e.g., userId, maxResults, q, labelIds).
 * @returns {Promise<object>} - The API response data.
 */
async function listMessages(authClient, options = {}) {
  const gmail = getGmailClient(authClient);
  const defaultOptions = {
    userId: 'me',
    maxResults: 10,
  };
  const listParams = { ...defaultOptions, ...options };

  console.log('Listing Gmail messages with params:', listParams);
  const response = await gmail.users.messages.list(listParams);
  console.log('Gmail messages.list response status:', response.status);
  return response.data;
}

// Add more Gmail helper functions as needed (e.g., getMessage, sendMessage, etc.)

module.exports = {
  getGmailClient,
  listMessages,
};
