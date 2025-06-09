/**
 * Setup script to grant service account permissions to shared calendars
 * Run this once after setting up your service account
 */

require('dotenv').config();
const { google } = require('googleapis');

async function grantServiceAccountAccess() {
  console.log('=== Calendar Permissions Setup ===\n');

  // Check required environment variables
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'VITE_GOOGLE_CALENDAR_PROJECTS',
    'VITE_GOOGLE_CALENDAR_WORK_ORDER',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  const calendars = [
    {
      id: process.env.VITE_GOOGLE_CALENDAR_PROJECTS,
      name: 'Projects Calendar',
    },
    {
      id: process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER,
      name: 'Work Orders Calendar',
    },
  ];

  console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('\nCalendars to configure:');
  calendars.forEach(cal => {
    console.log(`  - ${cal.name}: ${cal.id}`);
  });

  // You'll need to run this with user OAuth first to grant permissions
  console.log(
    '\n⚠️  IMPORTANT: This script needs to be run by a user who owns or has admin access to the calendars.'
  );
  console.log("    You'll be prompted to authenticate via Google OAuth.\n");

  // Create OAuth2 client for initial setup
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/callback' // Temporary callback for this script
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });

  console.log('Please visit this URL to authorize the application:');
  console.log(authUrl);
  console.log("\nAfter authorization, you'll be redirected to a URL starting with:");
  console.log('http://localhost:3000/callback?code=...');
  console.log('\nCopy the entire URL and paste it here:');

  // Wait for user input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const callbackUrl = await new Promise(resolve => {
    readline.question('Callback URL: ', resolve);
  });

  // Extract code from URL
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');

  if (!code) {
    console.error('❌ No authorization code found in URL');
    process.exit(1);
  }

  try {
    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Grant permissions to each calendar
    for (const cal of calendars) {
      if (!cal.id) continue;

      try {
        await calendar.acl.insert({
          calendarId: cal.id,
          requestBody: {
            role: 'writer',
            scope: {
              type: 'user',
              value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            },
          },
        });

        console.log(`\n✅ Granted service account access to ${cal.name}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`\n✓ Service account already has access to ${cal.name}`);
        } else {
          console.error(`\n❌ Failed to grant access to ${cal.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Calendar permissions setup complete!');
    console.log('\nYour service account can now access the shared calendars.');
    console.log('Events will be created using the service account when users are not logged in.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  readline.close();
}

// Run if called directly
if (require.main === module) {
  grantServiceAccountAccess().catch(console.error);
}

module.exports = { grantServiceAccountAccess };
