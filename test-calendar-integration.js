/**
 * Calendar Integration Test Script
 *
 * This script tests the Google Calendar integration by:
 * 1. Making sure the Settings component is accessible
 * 2. Checking that the Calendar tab is visible in Settings
 * 3. Testing the Schedule button in Contacts
 */

(function () {
  // Run this in browser console

  console.log('--- Google Calendar Integration Test ---');

  // Test 1: Check if GoogleCalendarSettings component exists
  const calendarSettingsExists =
    typeof window.GoogleCalendarSettings !== 'undefined' ||
    !!document.querySelector('[class*="GoogleCalendarSettings"]');
  console.log('1. GoogleCalendarSettings component exists:', calendarSettingsExists);

  // Test 2: Check if Settings page has Calendar tab
  const calendarTabExists = !!document.querySelector('[value="calendar"]');
  console.log('2. Settings page has Calendar tab:', calendarTabExists);

  // Test 3: Check if Schedule button works in Contacts
  const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn =>
    btn.textContent.includes('Schedule')
  );

  console.log('3. Schedule button found:', !!scheduleButton);
  if (scheduleButton) {
    console.log('   - Clicking Schedule button to test dialog...');
    scheduleButton.click();

    // Check if the dialog appears
    setTimeout(() => {
      const dialogExists = !!document.querySelector('[role="dialog"]');
      console.log('   - Dialog appeared after click:', dialogExists);

      const interactionFormExists =
        !!document.querySelector('form') && !!document.querySelector('button[type="submit"]');
      console.log('   - Interaction form exists in dialog:', interactionFormExists);

      const calendarToggleExists = Array.from(document.querySelectorAll('h4')).some(h4 =>
        h4.textContent.includes('Google Calendar')
      );
      console.log('   - Google Calendar toggle exists:', calendarToggleExists);
    }, 500);
  }

  console.log('--- End of Tests ---');
  console.log('To fully test calendar integration:');
  console.log('1. Navigate to Settings > Google Calendar');
  console.log('2. Connect your Google account');
  console.log('3. Try scheduling a meeting from Contacts');
  console.log('4. Add meeting details and enable calendar sync');
})();
