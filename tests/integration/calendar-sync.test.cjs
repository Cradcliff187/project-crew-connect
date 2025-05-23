/**
 * Integration Tests for Calendar Sync Functionality
 * Tests the full push/pull cycle and database write-back for Google Calendar integration
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const assert = require('assert');
const sinon = require('sinon');
const { google } = require('googleapis');
const calendarHelper = require('../../server/google-api-helpers/calendar-helper');
const { calendar, mockAuthClient, resetMockData } = require('../mocks/google-calendar-mock.cjs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CALENDAR_ID = 'test-calendar';

// Mock Supabase responses
let mockScheduleItems = [];
let lastUpdateParams = null;

// Mock Supabase client
const mockSupabase = {
  from: table => {
    if (table === 'schedule_items') {
      return {
        select: columns => ({
          eq: (column, value) => ({
            single: () => {
              const item = mockScheduleItems.find(item => item.id === value);
              return Promise.resolve({
                data: item,
                error: item ? null : { message: 'Item not found' },
              });
            },
          }),
        }),
        insert: data => ({
          select: () => ({
            single: () => {
              mockScheduleItems.push(data);
              return Promise.resolve({ data, error: null });
            },
          }),
        }),
        update: data => {
          lastUpdateParams = data;
          return {
            eq: (column, value) => ({
              select: () => ({
                single: () => {
                  const index = mockScheduleItems.findIndex(item => item.id === value);
                  if (index === -1) {
                    return Promise.resolve({
                      data: null,
                      error: { message: 'Item not found' },
                    });
                  }
                  mockScheduleItems[index] = { ...mockScheduleItems[index], ...data };
                  return Promise.resolve({
                    data: mockScheduleItems[index],
                    error: null,
                  });
                },
              }),
            }),
          };
        },
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    }
    return {};
  },
};

// Test data
const TEST_SCHEDULE_ITEM = {
  id: uuidv4(),
  project_id: 'TEST-PROJECT',
  title: 'Test Calendar Integration Item',
  description: 'This is a test item created by integration tests',
  start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  end_datetime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
  is_all_day: false,
  calendar_integration_enabled: true,
};

// Create a test schedule item in the database
async function createTestScheduleItem() {
  const { data, error } = await mockSupabase
    .from('schedule_items')
    .insert(TEST_SCHEDULE_ITEM)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test schedule item: ${error.message}`);
  }

  return data;
}

// Create a calendar event using the helper methods
async function createCalendarEvent(itemId) {
  const { data: item } = await mockSupabase
    .from('schedule_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (!item) {
    throw new Error(`Schedule item ${itemId} not found`);
  }

  // Use our calendar helper
  const eventData = {
    title: item.title,
    description: item.description || '',
    startTime: item.start_datetime,
    endTime: item.end_datetime,
    entityType: 'schedule_item',
    entityId: item.id,
    targetCalendarId: CALENDAR_ID,
  };

  return calendarHelper.createEvent(mockAuthClient, eventData);
}

// Update the google_event_id in the database
async function updateEventIdInDatabase(itemId, googleEventId) {
  const { data, error } = await mockSupabase
    .from('schedule_items')
    .update({
      google_event_id: googleEventId,
      invite_status: 'synced_no_invite',
      calendar_integration_enabled: true,
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update google_event_id: ${error.message}`);
  }

  return data;
}

// The tests
describe('Calendar Sync Integration Tests', function () {
  this.timeout(5000); // Reduced timeout for mock tests

  let calendarStub;
  let createdItem;
  let createdEvent;

  before(function () {
    // Stub the google.calendar method to return our mock
    calendarStub = sinon.stub(google, 'calendar').callsFake(calendar);
  });

  after(function () {
    // Restore the stub
    sinon.restore();
  });

  beforeEach(function () {
    // Reset the mocks before each test
    mockScheduleItems = [];
    lastUpdateParams = null;
    resetMockData();
  });

  it('should create a schedule item in the database', async function () {
    createdItem = await createTestScheduleItem();
    assert.ok(createdItem, 'Failed to create test schedule item');
    assert.strictEqual(createdItem.id, TEST_SCHEDULE_ITEM.id);
    assert.strictEqual(createdItem.title, TEST_SCHEDULE_ITEM.title);
  });

  it('should create a Google Calendar event', async function () {
    createdEvent = await createCalendarEvent(TEST_SCHEDULE_ITEM.id);
    assert.ok(createdEvent, 'Failed to create Google Calendar event');
    assert.strictEqual(createdEvent.summary, TEST_SCHEDULE_ITEM.title);
  });

  it('should write back the Google event ID to the database', async function () {
    const updatedItem = await updateEventIdInDatabase(TEST_SCHEDULE_ITEM.id, createdEvent.id);
    assert.ok(updatedItem, 'Failed to update Google event ID in database');
    assert.strictEqual(updatedItem.google_event_id, createdEvent.id);
    assert.strictEqual(lastUpdateParams.google_event_id, createdEvent.id);
  });

  it('should synchronize a schedule item with calendar', async function () {
    // Create a schedule item with a google_event_id
    const itemWithEventId = {
      ...TEST_SCHEDULE_ITEM,
      id: uuidv4(),
      google_event_id: 'event1', // Use an existing ID from our mock
    };

    // Add to mock DB
    mockScheduleItems.push(itemWithEventId);

    // Sync with calendar
    const result = await calendarHelper.syncScheduleItemWithCalendar(
      mockAuthClient,
      itemWithEventId,
      CALENDAR_ID
    );

    assert.strictEqual(result.action, 'updated');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.event.id, 'event1');
  });

  it('should create new calendar events for items without event IDs', async function () {
    // Create a schedule item without a google_event_id
    const itemWithoutEventId = {
      ...TEST_SCHEDULE_ITEM,
      id: uuidv4(),
      google_event_id: null,
    };

    // Add to mock DB
    mockScheduleItems.push(itemWithoutEventId);

    // Sync with calendar
    const result = await calendarHelper.syncScheduleItemWithCalendar(
      mockAuthClient,
      itemWithoutEventId,
      CALENDAR_ID
    );

    assert.strictEqual(result.action, 'created');
    assert.strictEqual(result.success, true);
    assert.ok(result.event.id, 'Event ID should be defined');
    assert.strictEqual(result.event.summary, itemWithoutEventId.title);
  });
});
