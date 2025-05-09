/**
 * Google Calendar Integration Test
 *
 * This script directly sets the necessary environment variables
 * and tests the Google Calendar integration.
 */

// Load required libraries
const fs = require('fs');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Set environment variables directly
const env = {
  SUPABASE_URL: 'https://zrxezqllmpdlhiudutme.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY',
  SUPABASE_PROJECT_ID: 'zrxezqllmpdlhiudutme',
  GOOGLE_CLIENT_ID: '1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  GOOGLE_REDIRECT_URI: 'http://localhost:8080/auth/google/callback',
  GOOGLE_SCOPES: 'https://www.googleapis.com/auth/calendar',
  GOOGLE_APPLICATION_CREDENTIALS: './credentials/calendar-service-account.json',
  GOOGLE_CALENDAR_PRIMARY: 'primary',
  GOOGLE_CALENDAR_PROJECT:
    'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com',
  GOOGLE_CALENDAR_WORK_ORDER:
    'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com',
};

// Set each environment variable
Object.entries(env).forEach(([key, value]) => {
  process.env[key] = value;
});

// Verify environment setup
console.log('Environment variables set:');
Object.entries(env).forEach(([key, value]) => {
  console.log(`- ${key}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
});

// Initialize Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Verify service account file exists
try {
  if (fs.existsSync(env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.log(`✅ Service account file found at ${env.GOOGLE_APPLICATION_CREDENTIALS}`);
  } else {
    console.error(`❌ Service account file not found at ${env.GOOGLE_APPLICATION_CREDENTIALS}`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error checking service account file:', err);
  process.exit(1);
}

// Check if the sync_calendar_changes function exists
async function checkDbFunction() {
  try {
    const { data, error } = await supabase.rpc('sync_calendar_changes', {
      p_calendar_id: 'test',
    });

    if (error && error.message.includes('function does not exist')) {
      console.error('❌ sync_calendar_changes function not found in database');
      console.log('Creating the function...');
      await createSyncCalendarChangesFunction();
    } else {
      console.log('✅ sync_calendar_changes function exists');
    }
  } catch (err) {
    console.error('Error checking sync_calendar_changes function:', err);
  }
}

// Create the sync_calendar_changes function if needed
async function createSyncCalendarChangesFunction() {
  const functionQuery = `
  CREATE OR REPLACE FUNCTION sync_calendar_changes(p_calendar_id TEXT)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    result JSONB;
    last_sync_time TIMESTAMP WITH TIME ZONE;
  BEGIN
    -- Get the last sync time for this calendar
    SELECT last_sync_time INTO last_sync_time
    FROM sync_cursors
    WHERE calendar_id = p_calendar_id;

    -- If no sync cursor exists, create one with current timestamp
    IF last_sync_time IS NULL THEN
      INSERT INTO sync_cursors (calendar_id, last_sync_time)
      VALUES (p_calendar_id, now())
      ON CONFLICT (calendar_id) DO UPDATE
      SET last_sync_time = now();

      last_sync_time := now();
    END IF;

    -- Update the last sync time for this calendar
    UPDATE sync_cursors
    SET last_sync_time = now()
    WHERE calendar_id = p_calendar_id;

    -- Return information about the sync operation
    result := jsonb_build_object(
      'status', 'success',
      'calendar_id', p_calendar_id,
      'last_sync_time', last_sync_time,
      'current_sync_time', now()
    );

    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- Log error and return error information
    result := jsonb_build_object(
      'status', 'error',
      'message', SQLERRM,
      'calendar_id', p_calendar_id
    );

    RETURN result;
  END;
  $$;
  `;

  try {
    const { error } = await supabase.rpc('pgexecute', { query: functionQuery });
    if (error) {
      console.error('Error creating sync_calendar_changes function:', error);
    } else {
      console.log('✅ sync_calendar_changes function created successfully');
    }
  } catch (err) {
    console.error('Error executing SQL for sync_calendar_changes function:', err);
  }
}

// Test Google Calendar API
async function testCalendar() {
  try {
    console.log('\n🔍 Starting Google Calendar integration test...');

    // Initialize Google API with service account credentials
    console.log('🔐 Initializing Google Calendar API with service account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [env.GOOGLE_SCOPES],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Log the service account email to help with sharing
    const serviceAccountCredentials = JSON.parse(
      fs.readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
    );
    console.log(`\n📧 Service Account Email: ${serviceAccountCredentials.client_email}`);
    console.log('⚠️ This email must be given access to each calendar you want to use.\n');

    // Test Primary Calendar first
    console.log(`\n🗓️ Testing Primary Calendar (${env.GOOGLE_CALENDAR_PRIMARY})...`);
    const primarySuccess = await testCalendarAccess(
      calendar,
      env.GOOGLE_CALENDAR_PRIMARY,
      'Primary'
    );

    // Test Project Calendar
    console.log(`\n🗓️ Testing Project Calendar (${env.GOOGLE_CALENDAR_PROJECT})...`);
    const projectSuccess = await testCalendarAccess(
      calendar,
      env.GOOGLE_CALENDAR_PROJECT,
      'Project'
    );

    // Test Work Order Calendar
    console.log(`\n🗓️ Testing Work Order Calendar (${env.GOOGLE_CALENDAR_WORK_ORDER})...`);
    const workOrderSuccess = await testCalendarAccess(
      calendar,
      env.GOOGLE_CALENDAR_WORK_ORDER,
      'Work Order'
    );

    // Register webhook channels if needed
    console.log('\n📡 Testing webhook registration...');
    await registerWebhookChannels(calendar);

    // Print summary of results
    console.log('\n📊 Calendar Test Summary:');
    console.log(`- Primary Calendar: ${primarySuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`- Project Calendar: ${projectSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`- Work Order Calendar: ${workOrderSuccess ? '✅ Success' : '❌ Failed'}`);

    if (!projectSuccess || !workOrderSuccess) {
      console.log('\n⚠️ Important: For any failed calendars, you need to:');
      console.log(
        `1. In Google Calendar, share each calendar with: ${serviceAccountCredentials.client_email}`
      );
      console.log('2. Give the service account "Make changes to events" permission at minimum');
      console.log('3. Wait a few minutes for the sharing to take effect');
      console.log('4. Run this test again');
    }

    console.log('\n✅ Calendar integration test completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Register webhook channels for both calendars
async function registerWebhookChannels(calendar) {
  // Define webhook URL from Supabase
  const webhookBaseUrl = env.SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
  const webhookUrl = `${webhookBaseUrl}/calendarWebhook`;

  console.log(`Using webhook URL: ${webhookUrl}`);

  try {
    // First, check if we already have active channels
    const { data: existingChannels, error } = await supabase
      .from('push_notification_channels')
      .select('*')
      .gt('expiration', new Date().toISOString());

    if (error) {
      console.error('Error checking existing channels:', error);
    } else if (existingChannels && existingChannels.length > 0) {
      console.log(`${existingChannels.length} active webhook channels found:`);
      existingChannels.forEach(channel => {
        console.log(`- Channel ${channel.id} for calendar ${channel.calendar_id}`);
        console.log(`  Expires: ${new Date(channel.expiration).toLocaleString()}`);
      });
    }

    // List of calendars to register webhook for
    const calendars = [{ id: env.GOOGLE_CALENDAR_PRIMARY, type: 'Primary' }];

    // Only add project and work order calendars if they were successfully accessed
    if (await testCalendarAccess(calendar, env.GOOGLE_CALENDAR_PROJECT, 'Project', false)) {
      calendars.push({ id: env.GOOGLE_CALENDAR_PROJECT, type: 'Project' });
    }

    if (await testCalendarAccess(calendar, env.GOOGLE_CALENDAR_WORK_ORDER, 'Work Order', false)) {
      calendars.push({ id: env.GOOGLE_CALENDAR_WORK_ORDER, type: 'Work Order' });
    }

    console.log(`\nAttempting to register webhooks for ${calendars.length} calendars...`);

    // Register webhooks for all accessible calendars
    const results = [];
    for (const cal of calendars) {
      // Check if we already have an active channel for this calendar
      const existingChannel = existingChannels?.find(ch => ch.calendar_id === cal.id);
      if (existingChannel) {
        console.log(
          `ℹ️ Skipping ${cal.type} calendar - already has an active webhook channel until ${new Date(existingChannel.expiration).toLocaleString()}`
        );
        results.push({ ...existingChannel, isNew: false });
        continue;
      }

      // Otherwise, register a new webhook
      const channel = await registerCalendarWebhook(calendar, cal.id, cal.type, webhookUrl);
      if (channel) {
        results.push({ ...channel, isNew: true });
      }
    }

    console.log(`\n📋 Webhook Registration Summary:`);
    if (results.length === 0) {
      console.log(`  No webhooks registered successfully.`);
    } else {
      results.forEach(result => {
        console.log(
          `- ${result.isNew ? 'NEW' : 'EXISTING'} webhook for calendar: ${result.calendar_id}`
        );
        if (result.expiration) {
          console.log(`  Expires: ${new Date(parseInt(result.expiration)).toLocaleString()}`);
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error registering webhook channels:', error);
    return [];
  }
}

// Test access to a specific calendar without creating test events
async function quickTestCalendarAccess(calendar, calendarId) {
  try {
    // Just try to get the calendar info without creating events
    await calendar.calendars.get({
      calendarId,
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Test access to a specific calendar
async function testCalendarAccess(calendar, calendarId, calendarType, createTestEvent = true) {
  try {
    console.log(`Accessing ${calendarType} calendar...`);

    // First, try to get the calendar info
    const calendarInfo = await calendar.calendars.get({
      calendarId,
    });

    console.log(
      `✅ Successfully accessed ${calendarType} calendar: "${calendarInfo.data.summary}"`
    );

    if (!createTestEvent) {
      return true;
    }

    // Create a test event
    console.log(`Creating test event in ${calendarType} calendar...`);
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 10);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const eventData = {
      summary: `Test Event - ${new Date().toISOString()}`,
      description: 'This is a test event created by the integration test script',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
    };

    // Insert the event
    const event = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });

    console.log(`✅ Test event created successfully with ID: ${event.data.id}`);

    // Delete the test event to clean up
    await calendar.events.delete({
      calendarId,
      eventId: event.data.id,
    });

    console.log('✅ Test event deleted successfully');

    return true;
  } catch (error) {
    if (!createTestEvent) {
      return false;
    }

    console.error(`❌ Error testing ${calendarType} calendar:`, error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }

    if (error.message === 'Not Found' || (error.response && error.response.status === 404)) {
      console.error(`⚠️ The service account does not have access to this calendar.`);
      console.error(`   You need to share the calendar with the service account email.`);
    }

    return false;
  }
}

// Register a webhook for a specific calendar
async function registerCalendarWebhook(calendar, calendarId, calendarType, webhookUrl) {
  try {
    console.log(`Registering webhook for ${calendarType} calendar...`);

    // Generate a unique channel ID
    const channelId = uuidv4();

    // Create watch request
    const watchRequest = {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      params: {
        ttl: '604800', // Maximum time to live in seconds (7 days)
      },
    };

    // Execute the watch request
    const response = await calendar.events.watch({
      calendarId,
      requestBody: watchRequest,
    });

    console.log(`✅ Successfully registered webhook for ${calendarType} calendar`);
    console.log(`- Channel ID: ${response.data.id}`);
    console.log(`- Resource ID: ${response.data.resourceId}`);
    console.log(`- Expiration: ${new Date(parseInt(response.data.expiration)).toLocaleString()}`);

    // Save to database
    const { data, error } = await supabase.from('push_notification_channels').upsert(
      {
        id: response.data.id,
        calendar_id: calendarId,
        resource_id: response.data.resourceId,
        expiration: new Date(parseInt(response.data.expiration)).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );

    if (error) {
      console.error(`Error saving channel to database:`, error);
    } else {
      console.log(`✅ Channel saved to database`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error registering webhook for ${calendarType} calendar:`, error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
    return null;
  }
}

// Run everything in sequence
async function run() {
  try {
    // First check database function
    await checkDbFunction();

    // Then test calendar integration
    await testCalendar();
  } catch (error) {
    console.error('Error during test execution:', error);
    process.exit(1);
  }
}

// Start the test
run();
