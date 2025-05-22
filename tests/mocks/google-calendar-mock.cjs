/**
 * Mock implementation of Google Calendar API for testing
 * This provides a way to test the calendar-helper.js module without making real API calls
 */

// Mock Google Calendar API response data
const mockEvents = [
  {
    id: 'event1',
    summary: 'Test Event 1',
    description: 'Test Description',
    start: { dateTime: '2025-05-25T10:00:00Z', timeZone: 'America/New_York' },
    end: { dateTime: '2025-05-25T11:00:00Z', timeZone: 'America/New_York' },
    location: 'Test Location',
  },
  {
    id: 'event2',
    summary: 'Test Event 2',
    description: 'Another test event',
    start: { dateTime: '2025-05-26T14:00:00Z', timeZone: 'America/New_York' },
    end: { dateTime: '2025-05-26T15:00:00Z', timeZone: 'America/New_York' },
  },
];

// Store created/updated events
let createdEvents = [];

// Mock calendar object
const mockCalendarApi = {
  events: {
    list: params => {
      console.log('Mock: Listing events with params:', params);
      return Promise.resolve({
        data: {
          items: mockEvents.slice(0, params.maxResults || 10),
          nextSyncToken: 'mock-sync-token',
        },
      });
    },

    get: params => {
      console.log('Mock: Getting event with ID:', params.eventId);
      const event =
        mockEvents.find(e => e.id === params.eventId) ||
        createdEvents.find(e => e.id === params.eventId);
      if (!event) {
        const error = new Error(`Event ${params.eventId} not found`);
        error.code = 404;
        throw error;
      }
      return Promise.resolve({ data: event });
    },

    insert: params => {
      console.log('Mock: Creating event:', params.resource);
      const newId = `new-event-${Date.now()}`;
      const newEvent = {
        id: newId,
        ...params.resource,
      };
      createdEvents.push(newEvent);
      return Promise.resolve({ data: newEvent });
    },

    update: params => {
      console.log('Mock: Updating event:', params.eventId);
      const existingEventIndex = mockEvents.findIndex(e => e.id === params.eventId);
      const createdEventIndex = createdEvents.findIndex(e => e.id === params.eventId);

      let updatedEvent;

      if (existingEventIndex >= 0) {
        updatedEvent = {
          ...mockEvents[existingEventIndex],
          ...params.resource,
        };
        mockEvents[existingEventIndex] = updatedEvent;
      } else if (createdEventIndex >= 0) {
        updatedEvent = {
          ...createdEvents[createdEventIndex],
          ...params.resource,
        };
        createdEvents[createdEventIndex] = updatedEvent;
      } else {
        const error = new Error(`Event ${params.eventId} not found`);
        error.code = 404;
        throw error;
      }

      return Promise.resolve({ data: updatedEvent });
    },

    delete: params => {
      console.log('Mock: Deleting event:', params.eventId);
      const existingEventIndex = mockEvents.findIndex(e => e.id === params.eventId);
      const createdEventIndex = createdEvents.findIndex(e => e.id === params.eventId);

      if (existingEventIndex >= 0) {
        mockEvents.splice(existingEventIndex, 1);
      } else if (createdEventIndex >= 0) {
        createdEvents.splice(createdEventIndex, 1);
      } else {
        const error = new Error(`Event ${params.eventId} not found`);
        error.code = 404;
        throw error;
      }

      return Promise.resolve({ data: {} });
    },
  },
};

// Mock auth client that can be used with the calendar helper
const mockAuthClient = {
  getAccessToken: () => Promise.resolve({ token: 'mock-token' }),
  request: () => Promise.resolve({}),
};

// Mock google.calendar function
const calendar = () => mockCalendarApi;

// Reset the state of mock data (useful between tests)
function resetMockData() {
  createdEvents = [];
}

module.exports = {
  calendar,
  mockAuthClient,
  resetMockData,
  mockEvents,
  createdEvents,
};
