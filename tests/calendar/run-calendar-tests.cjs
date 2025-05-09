/**
 * Script to manually set environment variables and test Google Calendar integration
 */

const { exec } = require('child_process');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Set environment variables manually
process.env.SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
process.env.SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';
process.env.SUPABASE_PROJECT_ID = 'zrxezqllmpdlhiudutme';
process.env.GOOGLE_CLIENT_ID =
  '1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = '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';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:8080/auth/google/callback';
process.env.GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar';
process.env.GOOGLE_APPLICATION_CREDENTIALS = './credentials/calendar-service-account.json';
process.env.GOOGLE_CALENDAR_PROJECT =
  'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com';
process.env.GOOGLE_CALENDAR_WORK_ORDER =
  'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Print environment variables to verify
console.log('Environment variables set:', {
  supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
  projectCalendarId: process.env.GOOGLE_CALENDAR_PROJECT ? 'Set' : 'Not set',
  workOrderCalendarId: process.env.GOOGLE_CALENDAR_WORK_ORDER ? 'Set' : 'Not set',
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set' : 'Not set',
});

// Test Google Calendar API
async function testCalendar() {
  try {
    console.log('🔍 Starting Google Calendar integration test...');

    // Initialize Google API with service account credentials
    console.log('🔐 Initializing Google Calendar API with service account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Get service account email for tracking
    const authInfo = await auth.getCredentials();
    const serviceAccountEmail = authInfo.client_email || 'unknown';
    console.log(`👤 Using service account: ${serviceAccountEmail}`);

    // Test Project Calendar
    console.log(`\n🗓️ Testing Project Calendar (${process.env.GOOGLE_CALENDAR_PROJECT})...`);
    await testCalendarEvents(calendar, process.env.GOOGLE_CALENDAR_PROJECT, 'Project');

    // Register webhooks for both calendars
    console.log('\n📡 Registering webhooks for calendars...');
    await registerWebhooks(calendar);

    console.log('\n✅ Calendar integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Test creating an event in a specific calendar
async function testCalendarEvents(calendar, calendarId, calendarType) {
  try {
    // Check if calendar exists
    console.log(`- Verifying ${calendarType} calendar exists...`);
    const calendarInfo = await calendar.calendars.get({
      calendarId,
    });
    console.log(`- Calendar verified: "${calendarInfo.data.summary}"`);

    // Create a test event
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 10); // 10 minutes from now

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // 30 minute event

    const eventData = {
      summary: `Test ${calendarType} Event - ${new Date().toISOString()}`,
      description: `This is a test event created by the integration test script.`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [],
      reminders: {
        useDefault: true,
      },
    };

    console.log(`- Creating test event in ${calendarType} calendar...`);
    const event = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });

    const eventId = event.data.id;
    console.log(`- Test event created successfully! ID: ${eventId}`);

    // Clean up by deleting the test event
    console.log(`- Cleaning up test event...`);
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    console.log(`- Test event deleted successfully`);

    return true;
  } catch (error) {
    console.error(`❌ Error testing ${calendarType} calendar:`, error);
    throw error;
  }
}

// Register webhooks for both calendars
async function registerWebhooks(calendar) {
  const { v4: uuidv4 } = require('uuid');

  // Webhook URL
  const WEBHOOK_BASE_URL = process.env.SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
  const WEBHOOK_URL = `${WEBHOOK_BASE_URL}/calendarWebhook`;

  console.log(`Using webhook URL: ${WEBHOOK_URL}`);

  // Register webhook for project calendar
  await registerWebhookForCalendar(calendar, process.env.GOOGLE_CALENDAR_PROJECT, 'Project');

  // Register webhook for work order calendar
  await registerWebhookForCalendar(calendar, process.env.GOOGLE_CALENDAR_WORK_ORDER, 'Work Order');

  // Function to register webhook for a calendar
  async function registerWebhookForCalendar(calendar, calendarId, calendarType) {
    try {
      // Generate a unique ID for this channel
      const channelId = uuidv4();

      // Create watch request
      const watchRequest = {
        id: channelId,
        type: 'web_hook',
        address: WEBHOOK_URL,
        params: {
          ttl: '604800', // Maximum time to live in seconds (7 days)
        },
      };

      console.log(`- Creating watch request for ${calendarType} calendar...`);

      // Execute the watch request
      const response = await calendar.events.watch({
        calendarId: calendarId,
        requestBody: watchRequest,
      });

      const { id, resourceId, expiration } = response.data;
      console.log(`- Channel created: ${id}`);
      console.log(`- Resource ID: ${resourceId}`);
      console.log(`- Expires: ${new Date(parseInt(expiration)).toISOString()}`);

      // Save the channel information to Supabase
      await saveChannelToDatabase(id, calendarId, resourceId, parseInt(expiration));

      return response.data;
    } catch (error) {
      console.error(`❌ Error registering webhook for ${calendarType} calendar:`, error);
      throw error;
    }
  }

  // Save channel to database
  async function saveChannelToDatabase(channelId, calendarId, resourceId, expiration) {
    try {
      const expirationDate = new Date(expiration);

      // Insert or update the channel record
      const { data, error } = await supabase.from('push_notification_channels').upsert(
        {
          id: channelId,
          calendar_id: calendarId,
          resource_id: resourceId,
          expiration: expirationDate.toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          returning: 'minimal',
        }
      );

      if (error) {
        console.error('Error saving channel to database:', error);
        throw error;
      }

      console.log(`- Channel saved to database for calendar: ${calendarId}`);
    } catch (error) {
      console.error('Error in saveChannelToDatabase:', error);
      throw error;
    }
  }
}

// Run the test
testCalendar().catch(console.error);
