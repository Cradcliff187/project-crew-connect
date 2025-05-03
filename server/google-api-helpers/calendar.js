const { google } = require('googleapis');

// Task 3: Reusable helper module for Google Calendar

/**
 * Initializes the Google Calendar API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.calendar_v3.Calendar} - Google Calendar API client instance.
 */
function getCalendarClient(authClient) {
  return google.calendar({ version: 'v3', auth: authClient });
}

/**
 * Lists events from the primary calendar.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {object} options - Options for listing events (e.g., timeMin, timeMax, maxResults, singleEvents, orderBy).
 * @returns {Promise<object>} - The API response data.
 */
async function listEvents(authClient, options = {}) {
  const calendar = getCalendarClient(authClient);
  const defaultOptions = {
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date().toISOString(), // Defaults to starting from now
  };
  const listParams = { ...defaultOptions, ...options };

  console.log('Listing Calendar events with params:', listParams);
  const response = await calendar.events.list(listParams);
  console.log('Calendar events.list response status:', response.status);
  return response.data;
}

// Add more Calendar helper functions as needed (e.g., createEvent, updateEvent, etc.)

module.exports = {
  getCalendarClient,
  listEvents,
};
