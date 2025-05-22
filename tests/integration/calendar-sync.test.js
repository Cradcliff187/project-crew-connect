/**
 * Integration Tests for Calendar Sync Functionality
 * Tests the full push/pull cycle and database write-back for Google Calendar integration
 */

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const assert = require('assert');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_PROJECT || 'primary';
const CREDENTIALS_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
  path.resolve(__dirname, '../../credentials/calendar-service-account.json');

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
let calendar;

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

// Helper functions
async function initGoogleCalendar() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`Google credentials file not found: ${CREDENTIALS_PATH}`);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authClient = await auth.getClient();
    return google.calendar({ version: 'v3', auth: authClient });
  } catch (error) {
    console.error('Error initializing Google Calendar API:', error);
    throw error;
  }
}

async function cleanupTestData(eventId) {
  // Delete the test event from Google Calendar if it exists
  if (eventId) {
    try {
      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: eventId,
      });
      console.log(`Deleted test event ${eventId} from Google Calendar`);
    } catch (error) {
      console.error(`Error deleting test event ${eventId}:`, error.message);
    }
  }

  // Delete the test schedule item from Supabase
  try {
    await supabase.from('schedule_items').delete().eq('id', TEST_SCHEDULE_ITEM.id);
    console.log(`Deleted test schedule item ${TEST_SCHEDULE_ITEM.id} from database`);
  } catch (error) {
    console.error(`Error deleting test schedule item:`, error.message);
  }
}

// Create a test schedule item in the database
async function createTestScheduleItem() {
  const { data, error } = await supabase
    .from('schedule_items')
    .insert(TEST_SCHEDULE_ITEM)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test schedule item: ${error.message}`);
  }

  return data;
}

// Create a calendar event using the helper methods from server
async function createCalendarEvent(itemId) {
  const item = await supabase
    .from('schedule_items')
    .select('*')
    .eq('id', itemId)
    .single()
    .then(({ data }) => data);

  if (!item) {
    throw new Error(`Schedule item ${itemId} not found`);
  }

  // Create calendar event
  const eventData = {
    summary: item.title,
    description: item.description || '',
    start: {
      dateTime: item.start_datetime,
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: item.end_datetime,
      timeZone: 'America/New_York',
    },
    extendedProperties: {
      private: {
        appSource: 'construction_management',
        entityType: 'schedule_item',
        entityId: item.id,
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: eventData,
  });

  return response.data;
}

// Update the google_event_id in the database
async function updateEventIdInDatabase(itemId, googleEventId) {
  const { data, error } = await supabase
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

// Fetch a calendar event by ID
async function getCalendarEvent(eventId) {
  const response = await calendar.events.get({
    calendarId: CALENDAR_ID,
    eventId: eventId,
  });

  return response.data;
}

// The tests
describe('Calendar Sync Integration Tests', function () {
  this.timeout(10000); // Allow up to 10 seconds for API calls

  let createdItem;
  let createdEvent;

  before(async function () {
    try {
      // Initialize Google Calendar client
      calendar = await initGoogleCalendar();
      console.log('Google Calendar client initialized');

      // Clean up any previous test data
      await cleanupTestData();
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  after(async function () {
    // Clean up test data
    if (createdEvent) {
      await cleanupTestData(createdEvent.id);
    }
  });

  it('should create a schedule item in the database', async function () {
    createdItem = await createTestScheduleItem();
    assert.ok(createdItem, 'Failed to create test schedule item');
    assert.strictEqual(createdItem.id, TEST_SCHEDULE_ITEM.id);
    assert.strictEqual(createdItem.title, TEST_SCHEDULE_ITEM.title);
    console.log(`Created test schedule item with ID: ${createdItem.id}`);
  });

  it('should create a Google Calendar event', async function () {
    createdEvent = await createCalendarEvent(createdItem.id);
    assert.ok(createdEvent, 'Failed to create Google Calendar event');
    assert.strictEqual(createdEvent.summary, TEST_SCHEDULE_ITEM.title);
    console.log(`Created Google Calendar event with ID: ${createdEvent.id}`);
  });

  it('should write back the Google event ID to the database', async function () {
    const updatedItem = await updateEventIdInDatabase(createdItem.id, createdEvent.id);
    assert.ok(updatedItem, 'Failed to update Google event ID in database');
    assert.strictEqual(updatedItem.google_event_id, createdEvent.id);
    console.log(`Updated schedule item with Google event ID: ${updatedItem.google_event_id}`);
  });

  it('should retrieve the event from Google Calendar using the stored ID', async function () {
    // Get the updated item from database
    const { data: latestItem } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('id', createdItem.id)
      .single();

    assert.ok(latestItem.google_event_id, 'Google event ID not found in database');

    // Retrieve the event from Google Calendar
    const retrievedEvent = await getCalendarEvent(latestItem.google_event_id);
    assert.ok(retrievedEvent, 'Failed to retrieve Google Calendar event');
    assert.strictEqual(retrievedEvent.id, latestItem.google_event_id);
    assert.strictEqual(retrievedEvent.summary, latestItem.title);
    console.log(`Successfully retrieved event from Google Calendar: ${retrievedEvent.summary}`);
  });
});
