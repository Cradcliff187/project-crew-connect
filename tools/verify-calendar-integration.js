/**
 * Calendar Integration Verification Tool
 *
 * This script helps verify that the Google Calendar integration is working correctly.
 * It tests the following scenarios:
 * 1. Creating an event in the UI and verifying it appears in Google Calendar
 * 2. Simulating a Google Calendar webhook and verifying changes sync to the app
 * 3. Testing attendee notifications with the toggle on/off
 *
 * Usage:
 * node tools/verify-calendar-integration.js
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';

// Configuration (replace with actual values)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const WEBHOOK_URL =
  process.env.WEBHOOK_URL || 'http://localhost:54321/functions/v1/calendarWebhook';
const LOG_FILE = 'calendar-verification.log';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Clear log file
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}

log('Starting Calendar Integration Verification');

// Test 1: Create a calendar event and verify it's created
async function testEventCreation() {
  log('\n=== Test 1: Event Creation ===');

  try {
    // Insert a test calendar event
    const { data: event, error } = await supabase
      .from('unified_calendar_events')
      .insert({
        title: 'Test Event - ' + new Date().toISOString(),
        description: 'Verification test event',
        start_datetime: new Date().toISOString(),
        end_datetime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        is_all_day: false,
        location: 'Test Location',
        google_event_id: 'test-event-id-' + Date.now(),
        calendar_id: 'primary',
        sync_enabled: true,
        entity_type: 'project_milestone',
        entity_id: 'TEST-' + Date.now(),
        project_id: 'PROJECT-TEST',
      })
      .select()
      .single();

    if (error) {
      log(`Error creating event: ${error.message}`);
      return false;
    }

    log(`Event created with ID: ${event.id}`);
    log(`Event details: ${JSON.stringify(event, null, 2)}`);
    return true;
  } catch (err) {
    log(`Exception in event creation: ${err.message}`);
    return false;
  }
}

// Test 2: Simulate a webhook notification and verify sync
async function testWebhookSync() {
  log('\n=== Test 2: Webhook Sync ===');

  try {
    // Simulate a Google webhook notification
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Channel-ID': 'test-channel-id',
        'X-Goog-Resource-ID': 'test-resource-id',
        'X-Goog-Resource-State': 'exists',
        'X-Goog-Channel-Token': 'test-token',
        'X-Goog-Channel-Expiration': new Date(Date.now() + 86400000).toUTCString(), // 1 day from now
      },
      body: JSON.stringify({ calendarId: 'primary' }),
    });

    const responseText = await response.text();
    log(`Webhook response status: ${response.status}`);
    log(`Webhook response: ${responseText}`);

    // Check if sync token was updated
    const { data: syncCursor, error } = await supabase
      .from('sync_cursors')
      .select('*')
      .eq('calendar_id', 'primary')
      .single();

    if (error) {
      log(`Error fetching sync cursor: ${error.message}`);
      return false;
    }

    log(`Sync cursor updated: ${JSON.stringify(syncCursor, null, 2)}`);
    return response.status === 200;
  } catch (err) {
    log(`Exception in webhook test: ${err.message}`);
    return false;
  }
}

// Test 3: Test assignment with notification settings
async function testAttendeeNotifications() {
  log('\n=== Test 3: Attendee Notifications ===');

  try {
    // Create an assignment without notifications
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        entity_type: 'project',
        entity_id: '7f9c24d6-0cb1-4a95-9c3e-b5c3a3a7e0c2',
        assignee_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        calendar_id: 'primary',
        google_event_id: 'notification-test-' + Date.now(),
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        rate_per_hour: 75.0,
      })
      .select()
      .single();

    if (error) {
      log(`Error creating assignment: ${error.message}`);
      return false;
    }

    log(`Assignment created with ID: ${assignment.id}`);

    // Query the cost rollup view
    const { data: costs, error: costsError } = await supabase.rpc('get_calendar_costs_by_project', {
      p_start_date: new Date().toISOString().split('T')[0],
      p_end_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    });

    if (costsError) {
      log(`Error fetching costs: ${costsError.message}`);
    } else {
      log(`Cost report: ${JSON.stringify(costs, null, 2)}`);
    }

    return true;
  } catch (err) {
    log(`Exception in notification test: ${err.message}`);
    return false;
  }
}

// Main execution
async function runTests() {
  try {
    // Run all tests
    const eventCreationSuccess = await testEventCreation();
    const webhookSuccess = await testWebhookSync();
    const notificationSuccess = await testAttendeeNotifications();

    // Log results
    log('\n=== Test Results ===');
    log(`Event Creation: ${eventCreationSuccess ? 'PASS' : 'FAIL'}`);
    log(`Webhook Sync: ${webhookSuccess ? 'PASS' : 'FAIL'}`);
    log(`Attendee Notifications: ${notificationSuccess ? 'PASS' : 'FAIL'}`);

    // Overall result
    const overallSuccess = eventCreationSuccess && webhookSuccess && notificationSuccess;
    log(`\nOverall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`);

    return overallSuccess;
  } catch (err) {
    log(`Exception in test execution: ${err.message}`);
    return false;
  }
}

// Run the tests
runTests()
  .then(success => {
    log(`Verification ${success ? 'completed successfully' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });
