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

/**
 * Creates a new calendar event.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {object} eventData - Event details to be created.
 * @param {string} eventData.title - Event title/summary.
 * @param {string} eventData.description - Event description.
 * @param {string} eventData.startTime - Start time in ISO format.
 * @param {string} eventData.endTime - End time in ISO format.
 * @param {string} eventData.location - Event location.
 * @param {string} eventData.entityType - Type of entity in our app ('project_milestone', 'work_order', etc).
 * @param {string} eventData.entityId - ID of the entity in our app.
 * @param {string} eventData.calendarId - Calendar ID (default: 'primary').
 * @param {boolean} eventData.sendNotifications - Whether to send notifications.
 * @param {Array<object>} [eventData.attendees] - Optional array of attendees (e.g., [{ email: 'test@example.com' }]).
 * @returns {Promise<object>} - The created event data.
 */
async function createEvent(authClient, eventData) {
  const calendar = getCalendarClient(authClient);

  // Calculate end time if not provided (default to 1 hour after start)
  const startTime = new Date(eventData.startTime);
  const endTime = eventData.endTime
    ? new Date(eventData.endTime)
    : new Date(startTime.getTime() + 60 * 60 * 1000);

  const event = {
    summary: eventData.title,
    description: eventData.description || '',
    start: {
      dateTime: startTime.toISOString(),
      timeZone: eventData.timeZone || 'America/New_York',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: eventData.timeZone || 'America/New_York',
    },
    location: eventData.location || '',
    colorId: eventData.colorId || '1', // Optional color coding
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
    // Add metadata to track source in our app
    extendedProperties: {
      private: {
        appSource: 'construction_management',
        entityType: eventData.entityType,
        entityId: eventData.entityId,
      },
    },
    // Add attendees if provided
    ...(eventData.attendees && eventData.attendees.length > 0
      ? { attendees: eventData.attendees }
      : {}),
  };

  console.log('Creating Calendar event:', event);

  // Determine whether to send updates/invites
  const sendUpdatesValue = eventData.attendees && eventData.attendees.length > 0 ? 'all' : 'none';

  const response = await calendar.events.insert({
    calendarId: eventData.targetCalendarId || 'primary', // Use targetCalendarId
    resource: event,
    sendUpdates: sendUpdatesValue, // Control invites/notifications
  });
  console.log('Calendar event created:', response.data);
  return response.data;
}

/**
 * Updates an existing calendar event.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {string} eventId - Google Calendar event ID.
 * @param {object} eventData - Updated event data.
 * @param {string} calendarId - Calendar ID (default: 'primary').
 * @param {Array<object>} [eventData.attendees] - Optional array of attendees for update.
 * @returns {Promise<object>} - The updated event data.
 */
async function updateEvent(authClient, eventId, eventData, targetCalendarId = 'primary') {
  const calendar = getCalendarClient(authClient);

  // First get existing event to maintain fields we don't update
  const existingEvent = await calendar.events.get({
    calendarId: targetCalendarId,
    eventId: eventId,
  });

  const event = {
    ...existingEvent.data,
    summary: eventData.title || existingEvent.data.summary,
    description: eventData.description || existingEvent.data.description,
    location: eventData.location || existingEvent.data.location,
  };

  // Add or update attendees if provided
  if (eventData.attendees) {
    event.attendees = eventData.attendees;
  }

  // Update date/time if provided
  if (eventData.startTime) {
    event.start = {
      dateTime: new Date(eventData.startTime).toISOString(),
      timeZone: eventData.timeZone || existingEvent.data.start.timeZone || 'America/New_York',
    };
  }

  if (eventData.endTime) {
    event.end = {
      dateTime: new Date(eventData.endTime).toISOString(),
      timeZone: eventData.timeZone || existingEvent.data.end.timeZone || 'America/New_York',
    };
  }

  console.log(`Updating Calendar event ${eventId}:`, event);

  // Determine whether to send updates/invites
  // Send updates if attendees are being modified or if explicitly requested, otherwise only to organizer
  const sendUpdatesValue = eventData.attendees || eventData.sendNotifications ? 'all' : 'none';

  const response = await calendar.events.update({
    calendarId: targetCalendarId,
    eventId: eventId,
    resource: event,
    sendUpdates: sendUpdatesValue, // Control invites/notifications
  });
  console.log('Calendar event updated:', response.data);
  return response.data;
}

/**
 * Deletes a calendar event.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {string} eventId - Google Calendar event ID.
 * @param {string} calendarId - Calendar ID (default: 'primary').
 * @returns {Promise<void>}
 */
async function deleteEvent(authClient, eventId, calendarId = 'primary') {
  const calendar = getCalendarClient(authClient);

  // Default to primary if calendarId is not provided or invalid
  const targetCalendarId = calendarId || 'primary';
  console.log(`Deleting Calendar event ${eventId} from calendar ${targetCalendarId}`);
  await calendar.events.delete({
    calendarId: targetCalendarId,
    eventId: eventId,
  });
  console.log('Calendar event deleted successfully');
}

module.exports = {
  getCalendarClient,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
