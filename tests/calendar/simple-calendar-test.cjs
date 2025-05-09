/**
 * Simple script to test Google Calendar API access
 */

const { google } = require('googleapis');
const fs = require('fs');

// Set up Google Calendar credentials directly
const CREDENTIALS_PATH = './credentials/calendar-service-account.json';
const PROJECT_CALENDAR_ID =
  'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com';

// Check if credentials file exists
try {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    console.log('✅ Credentials file found at', CREDENTIALS_PATH);
  } else {
    console.error('❌ Credentials file not found at', CREDENTIALS_PATH);
    process.exit(1);
  }
} catch (err) {
  console.error('Error checking credentials file:', err);
  process.exit(1);
}

// Test Google Calendar API access
async function testCalendarAccess() {
  try {
    console.log('🔍 Testing Google Calendar API access...');

    // Initialize Google API with service account credentials
    console.log('🔐 Initializing Google Calendar API with service account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Get service account email
    const authInfo = await auth.getCredentials();
    console.log(`👤 Using service account: ${authInfo.client_email || 'unknown'}`);

    // List calendars to verify access
    console.log('📅 Listing calendars to verify access...');
    const calendarList = await calendar.calendarList.list();
    console.log(`Found ${calendarList.data.items.length} calendars:`);
    calendarList.data.items.forEach(cal => {
      console.log(`- ${cal.summary} (${cal.id})`);
    });

    // Try to access the Project calendar
    console.log(`\n🔍 Attempting to access Project calendar: ${PROJECT_CALENDAR_ID}`);
    try {
      const projectCalendar = await calendar.calendars.get({
        calendarId: PROJECT_CALENDAR_ID,
      });
      console.log(`✅ Successfully accessed Project calendar: ${projectCalendar.data.summary}`);
    } catch (err) {
      console.error(`❌ Failed to access Project calendar: ${err.message}`);
      if (err.errors) {
        console.error('Error details:', JSON.stringify(err.errors, null, 2));
      }
    }

    console.log('\n✅ Calendar API test completed');
  } catch (err) {
    console.error('❌ Calendar API test failed:', err);
    if (err.errors) {
      console.error('Error details:', JSON.stringify(err.errors, null, 2));
    }
  }
}

// Run the test
testCalendarAccess().catch(err => {
  console.error('Unhandled error in testCalendarAccess:', err);
  process.exit(1);
});
