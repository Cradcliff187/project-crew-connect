/**
 * Update AJC Projects Shared Calendar ID
 *
 * This script updates the organization calendar with the AJC Projects shared calendar ID
 * by making a request to the server endpoint.
 */

const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ORGANIZATION_CALENDAR_UPDATE_ENDPOINT = `${SERVER_URL}/api/organization-calendar/update`;

async function updateAJCProjectsCalendarId() {
  try {
    console.log('Updating organization calendar with AJC Projects shared calendar ID...');

    // Make the request to update the calendar
    const response = await fetch(ORGANIZATION_CALENDAR_UPDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Server responded with status ${response.status}: ${errorData.error || 'Unknown error'}`
      );
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ Success:', data.message);
      console.log('Calendar details:');
      console.log(`  ID: ${data.calendar.id}`);
      console.log(`  Name: ${data.calendar.name}`);
      console.log(`  Google Calendar ID: ${data.calendar.google_calendar_id}`);
      console.log(`  Enabled: ${data.calendar.is_enabled ? 'Yes' : 'No'}`);
      console.log(`  Last Updated: ${new Date(data.calendar.updated_at).toLocaleString()}`);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to update calendar:', error.message);
    process.exit(1);
  }
}

// Execute the function
updateAJCProjectsCalendarId();
