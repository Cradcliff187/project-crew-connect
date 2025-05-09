/**
 * Scheduled Webhook Renewal Script
 *
 * This script renews Google Calendar webhook notifications that are about to expire.
 * It should be scheduled to run daily via a cron job or similar scheduler to ensure
 * uninterrupted calendar synchronization.
 *
 * Google Calendar webhooks expire after 7 days, so this script checks for channels
 * expiring within the next 48 hours and renews them.
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
};

// Set each environment variable
Object.entries(env).forEach(([key, value]) => {
  process.env[key] = value;
});

// Webhook URL - this should be the URL to our Supabase Edge Function
const WEBHOOK_BASE_URL = process.env.SUPABASE_URL.replace('supabase.co', 'functions.supabase.co');
const WEBHOOK_URL = `${WEBHOOK_BASE_URL}/calendarWebhook`;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Number of hours before expiration to renew (48 hours = 2 days)
const RENEWAL_THRESHOLD_HOURS = 48;

// Main function
async function main() {
  console.log(`Starting webhook renewal check at ${new Date().toISOString()}`);

  try {
    // Verify service account file exists
    if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      throw new Error(
        `Service account file not found at ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
      );
    }

    // Initialize Google API with service account credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [process.env.GOOGLE_SCOPES],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Find channels that are about to expire
    console.log(
      `Looking for webhook channels expiring in the next ${RENEWAL_THRESHOLD_HOURS} hours...`
    );

    // Calculate the threshold date (current time + RENEWAL_THRESHOLD_HOURS)
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() + RENEWAL_THRESHOLD_HOURS);

    // Find channels expiring before the threshold
    const { data: expiringChannels, error } = await supabase
      .from('push_notification_channels')
      .select('*')
      .lt('expiration', thresholdDate.toISOString())
      .gt('expiration', new Date().toISOString()); // Only get non-expired channels

    if (error) {
      console.error('Error fetching channels from database:', error);
      throw error;
    }

    console.log(`Found ${expiringChannels?.length || 0} channels that need renewal`);

    // Renew each expiring channel
    if (expiringChannels && expiringChannels.length > 0) {
      for (const channel of expiringChannels) {
        await renewChannel(calendar, channel);
      }
    } else {
      console.log('No webhook channels need renewal at this time');
    }

    console.log('Webhook renewal process completed successfully');
  } catch (error) {
    console.error('Error during webhook renewal:', error);
    process.exit(1);
  }
}

// Function to renew a single channel
async function renewChannel(calendar, channel) {
  console.log(`Renewing webhook for calendar: ${channel.calendar_id}`);
  console.log(`- Current channel ID: ${channel.id}`);
  console.log(`- Current expiration: ${new Date(channel.expiration).toLocaleString()}`);

  try {
    // First, verify we can access this calendar
    try {
      await calendar.calendars.get({
        calendarId: channel.calendar_id,
      });
    } catch (error) {
      console.error(
        `Cannot access calendar ${channel.calendar_id}, skipping renewal:`,
        error.message
      );
      return;
    }

    // Stop the existing channel
    try {
      await calendar.channels.stop({
        requestBody: {
          id: channel.id,
          resourceId: channel.resource_id,
        },
      });
      console.log(`✅ Successfully stopped existing channel: ${channel.id}`);
    } catch (error) {
      // If the channel is already expired or doesn't exist, just log and continue
      console.warn(`Warning stopping channel ${channel.id}:`, error.message);
    }

    // Create a new channel
    const newChannelId = uuidv4();
    const watchRequest = {
      id: newChannelId,
      type: 'web_hook',
      address: WEBHOOK_URL,
      params: {
        ttl: '604800', // Maximum time to live in seconds (7 days)
      },
    };

    // Register the new channel
    const response = await calendar.events.watch({
      calendarId: channel.calendar_id,
      requestBody: watchRequest,
    });

    const { id, resourceId, expiration } = response.data;
    console.log(`✅ New channel created: ${id}`);
    console.log(`- Resource ID: ${resourceId}`);
    console.log(`- Expires: ${new Date(parseInt(expiration)).toLocaleString()}`);

    // Save the new channel to the database
    const { error } = await supabase.from('push_notification_channels').upsert(
      {
        id: id,
        calendar_id: channel.calendar_id,
        resource_id: resourceId,
        expiration: new Date(parseInt(expiration)).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );

    if (error) {
      console.error('Error saving new channel to database:', error);
      throw error;
    }

    console.log(`✅ New channel saved to database for calendar: ${channel.calendar_id}`);

    // Delete the old channel record if it's different from the new one
    if (channel.id !== id) {
      const { error: deleteError } = await supabase
        .from('push_notification_channels')
        .delete()
        .eq('id', channel.id);

      if (deleteError) {
        console.error('Error deleting old channel record:', deleteError);
      } else {
        console.log(`✅ Old channel record deleted: ${channel.id}`);
      }
    }

    return response.data;
  } catch (error) {
    console.error(`Error renewing webhook for calendar ${channel.calendar_id}:`, error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
    return null;
  }
}

// Run the main function
main().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
