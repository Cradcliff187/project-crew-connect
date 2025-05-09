/**
 * Script to register Google Calendar webhooks for push notifications
 *
 * This script:
 * 1. Authenticates with Google Calendar API using service account
 * 2. Creates notification channels for both project and work order calendars
 * 3. Registers the webhook URL with Google Calendar
 * 4. Saves channel information to Supabase
 */

// Load required libraries
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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

// Verify environment variables are loaded
console.log('Environment variables set:');
Object.entries(env).forEach(([key, value]) => {
  console.log(`- ${key}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Calendar IDs from environment variables
const PRIMARY_CALENDAR_ID = process.env.GOOGLE_CALENDAR_PRIMARY || 'primary';
const PROJECT_CALENDAR_ID = process.env.GOOGLE_CALENDAR_PROJECT;
const WORK_ORDER_CALENDAR_ID = process.env.GOOGLE_CALENDAR_WORK_ORDER;

// Webhook URL - this should be the URL to our Supabase Edge Function
const WEBHOOK_BASE_URL = process.env.SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
const WEBHOOK_URL = `${WEBHOOK_BASE_URL}/calendarWebhook`;

console.log(`Using webhook URL: ${WEBHOOK_URL}`);

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});

/**
 * Main function to register webhooks for both calendars
 */
async function main() {
  try {
    // Before attempting to authenticate with Google, check if service account file exists
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
    }

    // Verify service account file exists
    try {
      if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        console.log(
          `✅ Service account file found at ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
        );
      } else {
        console.error(
          `❌ Service account file not found at ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
        );
        process.exit(1);
      }
    } catch (err) {
      console.error('Error checking service account file:', err);
      process.exit(1);
    }

    console.log('Initializing Google Calendar API...');

    // Initialize Google API with service account credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [process.env.GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar'],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Log the service account email for sharing calendar
    const serviceAccountCredentials = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
    );
    console.log(`\n📧 Service Account Email: ${serviceAccountCredentials.client_email}`);
    console.log('⚠️ This email must be given access to each calendar you want to use.\n');

    // First test access to calendars
    console.log('Testing calendar access before registering webhooks...');

    // Register webhook for primary calendar first
    console.log(`\nChecking access to primary calendar: ${PRIMARY_CALENDAR_ID}`);
    const primaryAccess = await testCalendarAccess(calendar, PRIMARY_CALENDAR_ID);
    if (primaryAccess) {
      console.log(`✅ Registering webhook for primary calendar`);
      await registerWebhookForCalendar(calendar, PRIMARY_CALENDAR_ID);
    } else {
      console.error(`❌ Cannot access primary calendar, skipping webhook registration`);
    }

    // Register webhook for project calendar
    console.log(`\nChecking access to project calendar: ${PROJECT_CALENDAR_ID}`);
    const projectAccess = await testCalendarAccess(calendar, PROJECT_CALENDAR_ID);
    if (projectAccess) {
      console.log(`✅ Registering webhook for project calendar`);
      await registerWebhookForCalendar(calendar, PROJECT_CALENDAR_ID);
    } else {
      console.error(`❌ Cannot access project calendar, skipping webhook registration`);
      console.error(
        `   Make sure to share this calendar with: ${serviceAccountCredentials.client_email}`
      );
    }

    // Register webhook for work order calendar
    console.log(`\nChecking access to work order calendar: ${WORK_ORDER_CALENDAR_ID}`);
    const workOrderAccess = await testCalendarAccess(calendar, WORK_ORDER_CALENDAR_ID);
    if (workOrderAccess) {
      console.log(`✅ Registering webhook for work order calendar`);
      await registerWebhookForCalendar(calendar, WORK_ORDER_CALENDAR_ID);
    } else {
      console.error(`❌ Cannot access work order calendar, skipping webhook registration`);
      console.error(
        `   Make sure to share this calendar with: ${serviceAccountCredentials.client_email}`
      );
    }

    console.log('\nWebhook registration process completed.');
  } catch (error) {
    console.error('Error registering webhooks:', error);
    throw error;
  }
}

/**
 * Tests access to a calendar before attempting to register a webhook
 */
async function testCalendarAccess(calendar, calendarId) {
  try {
    // Just try to get the calendar info
    const response = await calendar.calendars.get({
      calendarId,
    });
    console.log(`✅ Successfully accessed calendar: "${response.data.summary}"`);
    return true;
  } catch (error) {
    console.error(`❌ Error accessing calendar ${calendarId}:`, error.message);
    return false;
  }
}

/**
 * Registers a webhook for a specific calendar
 */
async function registerWebhookForCalendar(calendar, calendarId) {
  try {
    // Check if we already have an active channel for this calendar
    const { data: existingChannels, error } = await supabase
      .from('push_notification_channels')
      .select('*')
      .eq('calendar_id', calendarId)
      .gt('expiration', new Date().toISOString());

    if (error) {
      console.error('Error checking existing channels:', error);
    } else if (existingChannels && existingChannels.length > 0) {
      console.log(`ℹ️ Channel already exists for ${calendarId}:`);
      existingChannels.forEach(channel => {
        console.log(`- Channel ID: ${channel.id}`);
        console.log(`  Expires: ${new Date(channel.expiration).toLocaleString()}`);
      });
      return existingChannels[0];
    }

    // Generate a unique ID for this channel
    const channelId = uuidv4();

    // Set expiration to 7 days from now (Google's maximum is 604800 seconds = 7 days)
    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 6); // 6 days to be safe

    // Create watch request
    const watchRequest = {
      id: channelId,
      type: 'web_hook',
      address: WEBHOOK_URL,
      params: {
        ttl: '604800', // Maximum time to live in seconds (7 days)
      },
    };

    console.log(`Creating watch request for calendar: ${calendarId}`);

    // Execute the watch request
    const response = await calendar.events.watch({
      calendarId: calendarId,
      requestBody: watchRequest,
    });

    const { id, resourceId, expiration } = response.data;
    console.log(`✅ Channel created: ${id}`);
    console.log(`  Resource ID: ${resourceId}`);
    console.log(`  Expires: ${new Date(parseInt(expiration)).toISOString()}`);

    // Save the channel information to Supabase
    await saveChannelToDatabase(id, calendarId, resourceId, parseInt(expiration));

    return response.data;
  } catch (error) {
    console.error(`❌ Error registering webhook for calendar ${calendarId}:`, error.message);
    if (error.response && error.response.data) {
      console.error('  Error details:', error.response.data);
    }
    return null;
  }
}

/**
 * Saves the channel information to Supabase
 */
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
      }
    );

    if (error) {
      console.error('Error saving channel to database:', error);
      throw error;
    }

    console.log(`✅ Channel saved to database for calendar: ${calendarId}`);
  } catch (error) {
    console.error('Error in saveChannelToDatabase:', error);
    throw error;
  }
}
