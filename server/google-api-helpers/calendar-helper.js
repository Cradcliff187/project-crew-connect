/**
 * Consolidated Google Calendar API Helper
 * Provides reusable functions for both frontend and backend calendar integration
 */

// Import necessary modules
const { google } = require('googleapis');

/**
 * Creates a Google Calendar API client.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @returns {google.calendar_v3.Calendar} - Google Calendar API client instance.
 */
function getCalendarClient(authClient) {
  return google.calendar({ version: 'v3', auth: authClient });
}

/**
 * Lists events from a calendar.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {object} options - Options for listing events.
 * @param {string} [options.calendarId='primary'] - Calendar ID to use.
 * @param {string} [options.timeMin] - Start time in ISO format (defaults to now).
 * @param {string} [options.timeMax] - End time in ISO format.
 * @param {number} [options.maxResults=10] - Maximum number of results to return.
 * @param {boolean} [options.singleEvents=true] - Whether to expand recurring events.
 * @param {string} [options.orderBy='startTime'] - Order of events.
 * @returns {Promise<object>} - The API response data.
 */
async function listEvents(authClient, options = {}) {
  const calendar = getCalendarClient(authClient);
  const defaultOptions = {
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date().toISOString(), // Defaults to now
  };
  const listParams = { ...defaultOptions, ...options };

  const response = await calendar.events.list(listParams);
  return response.data;
}

/**
 * Creates a new calendar event.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {object} eventData - Event details to be created.
 * @param {string} eventData.title - Event title/summary.
 * @param {string} [eventData.description] - Event description.
 * @param {string} eventData.startTime - Start time in ISO format.
 * @param {string} [eventData.endTime] - End time in ISO format.
 * @param {string} [eventData.location] - Event location.
 * @param {string} [eventData.timeZone='America/New_York'] - Time zone for the event.
 * @param {string} [eventData.entityType] - Type of entity in our app.
 * @param {string} [eventData.entityId] - ID of the entity in our app.
 * @param {string} [eventData.targetCalendarId='primary'] - Calendar ID to use.
 * @param {boolean} [eventData.sendNotifications=false] - Whether to send notifications.
 * @param {Array<object>} [eventData.attendees] - Optional array of attendees.
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
        entityType: eventData.entityType || 'schedule_item',
        entityId: eventData.entityId || '',
      },
    },
    // Add attendees if provided
    ...(eventData.attendees && eventData.attendees.length > 0
      ? { attendees: eventData.attendees }
      : {}),
  };

  // Determine whether to send updates/invites
  const sendUpdatesValue = eventData.attendees && eventData.attendees.length > 0 ? 'all' : 'none';

  const response = await calendar.events.insert({
    calendarId: eventData.targetCalendarId || 'primary',
    resource: event,
    sendUpdates: eventData.sendNotifications ? 'all' : sendUpdatesValue,
  });

  return response.data;
}

/**
 * Updates an existing calendar event.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {string} eventId - Google Calendar event ID.
 * @param {object} eventData - Updated event data.
 * @param {string} [calendarId='primary'] - Calendar ID to use.
 * @returns {Promise<object>} - The updated event data.
 */
async function updateEvent(authClient, eventId, eventData, calendarId = 'primary') {
  const calendar = getCalendarClient(authClient);

  // First get existing event to maintain fields we don't update
  const existingEvent = await calendar.events.get({
    calendarId: calendarId,
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

  // Determine whether to send updates/invites
  const sendUpdatesValue = eventData.attendees || eventData.sendNotifications ? 'all' : 'none';

  const response = await calendar.events.update({
    calendarId: calendarId,
    eventId: eventId,
    resource: event,
    sendUpdates: sendUpdatesValue,
  });

  return response.data;
}

/**
 * Deletes a calendar event.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {string} eventId - Google Calendar event ID.
 * @param {string} [calendarId='primary'] - Calendar ID to use.
 * @returns {Promise<void>}
 */
async function deleteEvent(authClient, eventId, calendarId = 'primary') {
  const calendar = getCalendarClient(authClient);
  await calendar.events.delete({
    calendarId: calendarId,
    eventId: eventId,
  });
}

/**
 * Gets a single calendar event.
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {string} eventId - Google Calendar event ID.
 * @param {string} [calendarId='primary'] - Calendar ID to use.
 * @returns {Promise<object>} - The event data.
 */
async function getEvent(authClient, eventId, calendarId = 'primary') {
  const calendar = getCalendarClient(authClient);
  const response = await calendar.events.get({
    calendarId: calendarId,
    eventId: eventId,
  });
  return response.data;
}

/**
 * Syncs a schedule item with Google Calendar (creates or updates event).
 * @param {object} authClient - An authenticated OAuth2 client or GoogleAuth client.
 * @param {object} scheduleItem - Schedule item data.
 * @param {string} calendarId - Calendar ID to use (REQUIRED for schedule items).
 * @returns {Promise<object>} - The created or updated event data and status.
 */
async function syncScheduleItemWithCalendar(authClient, scheduleItem, calendarId) {
  if (!calendarId) {
    throw new Error('Calendar ID is required for schedule item sync');
  }

  // If the item already has a Google event ID, update that event
  if (scheduleItem.google_event_id) {
    try {
      const eventData = {
        title: scheduleItem.title,
        description: scheduleItem.description || '',
        startTime: scheduleItem.start_datetime,
        endTime: scheduleItem.end_datetime,
        entityType: 'schedule_item',
        entityId: scheduleItem.id,
      };

      // Add attendees if available
      if (scheduleItem.assignee_email) {
        eventData.attendees = [{ email: scheduleItem.assignee_email }];
      }

      const updatedEvent = await updateEvent(
        authClient,
        scheduleItem.google_event_id,
        eventData,
        calendarId
      );
      return {
        event: updatedEvent,
        action: 'updated',
        success: true,
      };
    } catch (error) {
      // If the event no longer exists, create a new one
      if (error.code === 404) {
        return await createNewEventForScheduleItem(authClient, scheduleItem, calendarId);
      }
      throw error;
    }
  } else {
    // Create a new event if there's no Google event ID
    return await createNewEventForScheduleItem(authClient, scheduleItem, calendarId);
  }
}

/**
 * Helper function to create a new event for a schedule item.
 * @private
 */
async function createNewEventForScheduleItem(authClient, scheduleItem, calendarId) {
  const eventData = {
    title: scheduleItem.title,
    description: scheduleItem.description || '',
    startTime: scheduleItem.start_datetime,
    endTime: scheduleItem.end_datetime,
    entityType: 'schedule_item',
    entityId: scheduleItem.id,
    targetCalendarId: calendarId,
  };

  // Add attendees if available
  if (scheduleItem.assignee_email) {
    eventData.attendees = [{ email: scheduleItem.assignee_email }];
  }

  const createdEvent = await createEvent(authClient, eventData);
  return {
    event: createdEvent,
    action: 'created',
    success: true,
  };
}

// Export the functions
module.exports = {
  getCalendarClient,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  syncScheduleItemWithCalendar,
};
