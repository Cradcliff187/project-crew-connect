/**
 * Manual Verification Script for Calendar Sync
 * Verifies that an existing schedule item has been synced with Google Calendar
 */

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_PROJECT || 'primary';
const CREDENTIALS_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
  path.resolve(__dirname, 'credentials/calendar-service-account.json');

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test schedule item ID
const SCHEDULE_ITEM_ID = 'd0476c15-1c2a-4bd5-96f9-945648d6415c';

// Helper function to initialize Google Calendar API
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

// Check the database for the schedule item
async function verifyScheduleItemInDatabase() {
  console.log(`\n2. VERIFYING: Checking if google_event_id is stored in the database...`);

  const { data: item, error } = await supabase
    .from('schedule_items')
    .select('id, title, google_event_id, invite_status, calendar_integration_enabled')
    .eq('id', SCHEDULE_ITEM_ID)
    .single();

  if (error) {
    console.error(`Error fetching schedule item from database:`, error);
    return false;
  }

  if (!item) {
    console.error(`Schedule item with ID ${SCHEDULE_ITEM_ID} not found in database.`);
    return false;
  }

  console.log('Schedule item in database:', item);

  if (!item.google_event_id) {
    console.error(`❌ FAILURE: google_event_id is not set in the database.`);
    return false;
  }

  console.log(`✅ SUCCESS: google_event_id "${item.google_event_id}" is stored in the database.`);
  return item;
}

// Verify the Google Calendar event
async function verifyGoogleCalendarEvent(eventId) {
  console.log(`\n3. VERIFYING: Checking if the event exists in Google Calendar...`);

  try {
    const calendar = await initGoogleCalendar();
    const event = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    console.log('Google Calendar event:', {
      id: event.data.id,
      summary: event.data.summary,
      start: event.data.start,
      end: event.data.end,
    });

    console.log(`✅ SUCCESS: Event "${event.data.summary}" found in Google Calendar.`);
    return true;
  } catch (error) {
    console.error(`❌ FAILURE: Could not find event in Google Calendar:`, error.message);
    return false;
  }
}

// List all events in the calendar
async function listCalendarEvents() {
  console.log(`\n4. VERIFYING: Listing all events in the Google Calendar...`);

  try {
    const calendar = await initGoogleCalendar();
    const events = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date('2025-05-01T00:00:00Z').toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = events.data.items.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start,
    }));

    console.log('Events in Google Calendar:', JSON.stringify(items, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ FAILURE: Could not list events in Google Calendar:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log(`Loading environment from: ${path.resolve(__dirname, '.env.local')}`);
  console.log('=== VERIFYING FULL PUSH/PULL CYCLE ===');

  try {
    // 1. Check if the schedule item exists in the database and has a google_event_id
    const item = await verifyScheduleItemInDatabase();
    if (!item) {
      return;
    }

    // 2. Verify the Google Calendar event exists
    await verifyGoogleCalendarEvent(item.google_event_id);

    // 3. List all events in the calendar
    await listCalendarEvents();

    console.log('\n=== VERIFICATION COMPLETE ===');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

// Run the verification
main();
