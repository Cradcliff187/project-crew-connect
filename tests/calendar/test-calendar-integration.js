/**
 * Test script for Google Calendar integration
 *
 * This script tests:
 * 1. Authentication with Google Calendar API
 * 2. Creating events in both shared calendars
 * 3. Verifying event creation was successful
 *
 * Prerequisites:
 * - Node.js installed
 * - .env file configured
 * - Service account credentials file in place
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as dotenv from 'dotenv';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env file in the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../../'); // Go up to root directory
const envPath = fs.existsSync(resolve(rootDir, '.env'))
  ? resolve(rootDir, '.env')
  : resolve(rootDir, '.env.local');
dotenv.config({ path: envPath });

// Verify environment variables are loaded
console.log('Environment variables loaded from:', envPath);
console.log('Environment variables loaded:', {
  supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
  projectCalendarId:
    process.env.GOOGLE_CALENDAR_PROJECT || process.env.PROJECTS_CALENDAR_ID ? 'Set' : 'Not set',
  workOrderCalendarId:
    process.env.GOOGLE_CALENDAR_WORK_ORDER || process.env.WORKORDERS_CALENDAR_ID
      ? 'Set'
      : 'Not set',
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set' : 'Not set',
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Calendar IDs from environment variables - check both possible names
const PROJECT_CALENDAR_ID = process.env.GOOGLE_CALENDAR_PROJECT || process.env.PROJECTS_CALENDAR_ID;
const WORK_ORDER_CALENDAR_ID =
  process.env.GOOGLE_CALENDAR_WORK_ORDER || process.env.WORKORDERS_CALENDAR_ID;

// Run the test function
main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

/**
 * Main test function
 */
async function main() {
  try {
    console.log('🔍 Starting Google Calendar integration test...');

    // Validate environment variables
    validateEnvironment();

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
    console.log(`\n🗓️ Testing Project Calendar (${PROJECT_CALENDAR_ID})...`);
    await testCalendar(calendar, PROJECT_CALENDAR_ID, 'Project');

    // Test Work Order Calendar
    console.log(`\n🗓️ Testing Work Order Calendar (${WORK_ORDER_CALENDAR_ID})...`);
    await testCalendar(calendar, WORK_ORDER_CALENDAR_ID, 'Work Order');

    console.log('\n✅ Calendar integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Test creating an event in a specific calendar
 */
async function testCalendar(calendar, calendarId, calendarType) {
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

    // Verify event was created by retrieving it
    console.log(`- Verifying event creation by retrieving event...`);
    const retrievedEvent = await calendar.events.get({
      calendarId,
      eventId,
    });

    if (retrievedEvent.data.id === eventId) {
      console.log(`- Event verified successfully!`);
    } else {
      throw new Error('Event verification failed');
    }

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

/**
 * Validate environment variables
 */
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');

  // Check Supabase configuration
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase configuration in .env file');
  }

  // Check Google API configuration
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
  }

  // Check calendar IDs - support both naming conventions
  if (
    !(process.env.GOOGLE_CALENDAR_PROJECT || process.env.PROJECTS_CALENDAR_ID) ||
    !(process.env.GOOGLE_CALENDAR_WORK_ORDER || process.env.WORKORDERS_CALENDAR_ID)
  ) {
    throw new Error('Missing Google Calendar IDs in .env file');
  }

  console.log('✅ Environment validation complete');
}
