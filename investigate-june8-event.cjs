/**
 * Investigation Script for Missing June 8th Calendar Event
 *
 * This script queries the database to find schedule items created on or around June 8th
 * and checks their calendar integration status to understand what happened.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function investigateJune8Event() {
  console.log('🔍 Investigating June 8th Calendar Event...\n');

  try {
    // First, let's check what the current date is to ensure we're looking in the right place
    console.log('0. Current investigation context:');
    console.log(`   Current Date: ${new Date().toISOString()}`);
    console.log(`   Looking for events on: 2025-06-08`);
    console.log(`   User reported: Event showed as successful but doesn't appear on calendar\n`);

    // Search for schedule items created on June 8th, 2025
    console.log('1. Searching for schedule items created on June 8th, 2025...');

    const { data: june8Items, error: june8Error } = await supabase
      .from('schedule_items')
      .select('*')
      .gte('created_at', '2025-06-08T00:00:00Z')
      .lt('created_at', '2025-06-09T00:00:00Z')
      .order('created_at', { ascending: false });

    if (june8Error) {
      console.error('❌ Error querying June 8th items:', june8Error);
    } else {
      console.log(`✅ Found ${june8Items.length} schedule items created on June 8th`);
    }

    // Expand search to the last 3 days
    console.log('\n2. Searching for schedule items created in the last 3 days...');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: recentItems, error: recentError } = await supabase
      .from('schedule_items')
      .select('*')
      .gte('created_at', threeDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Error querying recent items:', recentError);
    } else {
      console.log(`✅ Found ${recentItems.length} schedule items created in the last 3 days`);

      if (recentItems.length > 0) {
        console.log('\n📋 Recent Schedule Items:');
        recentItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title}`);
          console.log(`   ID: ${item.id}`);
          console.log(`   Project ID: ${item.project_id}`);
          console.log(`   Start Time: ${item.start_datetime}`);
          console.log(`   End Time: ${item.end_datetime}`);
          console.log(`   Calendar Integration: ${item.calendar_integration_enabled}`);
          console.log(`   Google Event ID: ${item.google_event_id || 'NONE'}`);
          console.log(`   Send Invite: ${item.send_invite}`);
          console.log(`   Invite Status: ${item.invite_status || 'NONE'}`);
          console.log(`   Last Sync Error: ${item.last_sync_error || 'NONE'}`);
          console.log(`   Created At: ${item.created_at}`);

          if (item.assignee_type && item.assignee_id) {
            console.log(`   Assignee: ${item.assignee_type} - ${item.assignee_id}`);
          }
        });
      }
    }

    // Search for ANY schedule items to see if the table has data
    console.log('\n3. Checking if schedule_items table has any data...');

    const { data: allItems, error: allError } = await supabase
      .from('schedule_items')
      .select('id, title, created_at, calendar_integration_enabled, google_event_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('❌ Error querying all items:', allError);
    } else {
      console.log(`✅ Found ${allItems.length} total schedule items (showing latest 10)`);

      if (allItems.length > 0) {
        console.log('\n📊 Latest Schedule Items in Database:');
        allItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title}`);
          console.log(`   ID: ${item.id}`);
          console.log(`   Created At: ${item.created_at}`);
          console.log(`   Calendar Integration: ${item.calendar_integration_enabled}`);
          console.log(`   Google Event ID: ${item.google_event_id || 'NONE'}`);
        });
      } else {
        console.log('⚠️ No schedule items found in the database at all!');
      }
    }

    // Check for any items with Google Event IDs to see if calendar integration is working
    console.log('\n4. Checking for any successful calendar integrations...');

    const { data: successfulItems, error: successError } = await supabase
      .from('schedule_items')
      .select('*')
      .not('google_event_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (successError) {
      console.error('❌ Error querying successful items:', successError);
    } else {
      console.log(`✅ Found ${successfulItems.length} items with Google Event IDs`);

      if (successfulItems.length > 0) {
        console.log('\n✅ Successful Calendar Integrations:');
        successfulItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title}`);
          console.log(`   ID: ${item.id}`);
          console.log(`   Google Event ID: ${item.google_event_id}`);
          console.log(`   Created At: ${item.created_at}`);
          console.log(`   Start Time: ${item.start_datetime}`);
        });
      } else {
        console.log('⚠️ No schedule items have been successfully synced to Google Calendar');
      }
    }

    // Check for failed calendar integrations
    console.log('\n5. Checking for failed calendar integrations...');

    const { data: failedItems, error: failedError } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('calendar_integration_enabled', true)
      .is('google_event_id', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (failedError) {
      console.error('❌ Error querying failed items:', failedError);
    } else {
      console.log(
        `✅ Found ${failedItems.length} items with calendar integration enabled but no Google Event ID`
      );

      if (failedItems.length > 0) {
        console.log('\n⚠️ Failed Calendar Integrations:');
        failedItems.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title}`);
          console.log(`   ID: ${item.id}`);
          console.log(`   Created At: ${item.created_at}`);
          console.log(`   Start Time: ${item.start_datetime}`);
          console.log(`   Last Sync Error: ${item.last_sync_error || 'NONE'}`);
        });
      }
    }

    // Summary and analysis
    console.log('\n🔍 INVESTIGATION SUMMARY:');
    console.log('='.repeat(50));

    if (june8Items.length === 0) {
      console.log('❌ FINDING: No schedule items were created on June 8th, 2025');
      console.log('💡 POSSIBLE CAUSES:');
      console.log('   1. The event creation failed before reaching the database');
      console.log('   2. The frontend showed success but the backend failed silently');
      console.log('   3. The date might be in a different timezone');
      console.log('   4. The event was created as a different entity type (not schedule_item)');
    }

    if (recentItems.length === 0) {
      console.log('❌ FINDING: No recent schedule items found in the database');
      console.log('💡 This suggests the schedule creation process may not be working');
    }

    if (allItems.length === 0) {
      console.log('❌ CRITICAL: No schedule items exist in the database at all!');
      console.log('💡 This indicates a fundamental issue with schedule item creation');
    }
  } catch (error) {
    console.error('❌ Unexpected error during investigation:', error);
  }

  console.log('\n🔍 Investigation Complete');
}

// Run the investigation
investigateJune8Event().catch(console.error);
