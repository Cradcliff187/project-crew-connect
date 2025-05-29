// Script to check RLS policies on schedule_items table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Service role key (has admin privileges)
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

// Anon key (respects RLS policies)
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

// Initialize clients
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

// Results storage
const results = {
  serviceRoleTests: {},
  anonTests: {},
};

// Function to run a specific test query
async function runTest(client, name, query) {
  console.log(`Running test: ${name}`);
  try {
    const result = await client.rpc(query.rpc, query.params);
    return { success: !result.error, data: result.data, error: result.error };
  } catch (error) {
    return { success: false, error };
  }
}

// Function to check schedule_items table structure
async function getTableStructure() {
  console.log('Checking schedule_items table structure...');
  try {
    const { data, error } = await supabaseAdmin.rpc('get_table_info', {
      table_name: 'schedule_items',
    });

    if (error) {
      console.error('Error getting table structure:', error);
      return;
    }

    console.log('Table structure:', data);
    return data;
  } catch (err) {
    console.error('Exception getting table structure:', err);
  }
}

// Function to test access with service role key
async function testServiceRoleAccess() {
  console.log('\n--- Testing with Service Role Key ---');

  try {
    // Test simple select
    const { data, error } = await supabaseAdmin
      .from('schedule_items')
      .select('id, title, description')
      .limit(5);

    results.serviceRoleTests.simpleSelect = {
      success: !error,
      data: data,
      error: error,
    };

    console.log('Service Role - Simple Select:', !error ? 'Success' : 'Failed');

    // Test select with calendar fields
    const { data: calData, error: calError } = await supabaseAdmin
      .from('schedule_items')
      .select('id, title, google_event_id, calendar_integration_enabled')
      .limit(5);

    results.serviceRoleTests.calendarFields = {
      success: !calError,
      data: calData,
      error: calError,
    };

    console.log('Service Role - Calendar Fields Select:', !calError ? 'Success' : 'Failed');
  } catch (err) {
    console.error('Exception during service role tests:', err);
  }
}

// Function to test access with anon key
async function testAnonAccess() {
  console.log('\n--- Testing with Anon Key ---');

  try {
    // Test simple select
    const { data, error } = await supabaseAnon
      .from('schedule_items')
      .select('id, title, description')
      .limit(5);

    results.anonTests.simpleSelect = {
      success: !error,
      data: data,
      error: error,
    };

    console.log('Anon - Simple Select:', !error ? 'Success' : 'Failed');

    // Test select with calendar fields
    const { data: calData, error: calError } = await supabaseAnon
      .from('schedule_items')
      .select('id, title, google_event_id, calendar_integration_enabled')
      .limit(5);

    results.anonTests.calendarFields = {
      success: !calError,
      data: calData,
      error: calError,
    };

    console.log('Anon - Calendar Fields Select:', !calError ? 'Success' : 'Failed');
  } catch (err) {
    console.error('Exception during anon tests:', err);
  }
}

// Main function
async function main() {
  try {
    await getTableStructure();
    await testServiceRoleAccess();
    await testAnonAccess();

    // Save results to file
    fs.writeFileSync('rls-check-results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to rls-check-results.json');

    // Create/update RLS_CHECK.md with results
    const rlsCheckContent = `# Supabase Row Level Security (RLS) Validation Results

## Overview

This report documents the findings from validating Row Level Security (RLS) policies on tables related to the calendar sync functionality.

## Test Methodology

1. Queries were executed against the schedule_items table using:
   - SUPABASE_SERVICE_ROLE_KEY (admin access)
   - SUPABASE_ANON_KEY (public/anonymous access)

2. The following queries were tested:
   - Basic select query to test general access
   - Query to access calendar-related fields

## Schedule Items Table RLS Test Results

### Using Service Role Key

**Basic select query:**
\`\`\`sql
SELECT id, title, description FROM schedule_items LIMIT 5;
\`\`\`

Result: ${results.serviceRoleTests.simpleSelect?.success ? 'SUCCESS' : 'FAILED'}
${results.serviceRoleTests.simpleSelect?.error ? `Error: ${JSON.stringify(results.serviceRoleTests.simpleSelect.error)}` : ''}

**Calendar fields query:**
\`\`\`sql
SELECT id, title, google_event_id, calendar_integration_enabled FROM schedule_items LIMIT 5;
\`\`\`

Result: ${results.serviceRoleTests.calendarFields?.success ? 'SUCCESS' : 'FAILED'}
${results.serviceRoleTests.calendarFields?.error ? `Error: ${JSON.stringify(results.serviceRoleTests.calendarFields.error)}` : ''}

### Using Anonymous Key

**Basic select query:**
\`\`\`sql
SELECT id, title, description FROM schedule_items LIMIT 5;
\`\`\`

Result: ${results.anonTests.simpleSelect?.success ? 'SUCCESS' : 'FAILED'}
${results.anonTests.simpleSelect?.error ? `Error: ${JSON.stringify(results.anonTests.simpleSelect.error)}` : ''}

**Calendar fields query:**
\`\`\`sql
SELECT id, title, google_event_id, calendar_integration_enabled FROM schedule_items LIMIT 5;
\`\`\`

Result: ${results.anonTests.calendarFields?.success ? 'SUCCESS' : 'FAILED'}
${results.anonTests.calendarFields?.error ? `Error: ${JSON.stringify(results.anonTests.calendarFields.error)}` : ''}

## Recommendations

${
  !results.anonTests.simpleSelect?.success && results.serviceRoleTests.simpleSelect?.success
    ? `As expected, the service role key can access the schedule_items table, but the anonymous key is restricted by RLS policies. This is the desired behavior.`
    : results.anonTests.simpleSelect?.success
      ? `**SECURITY RISK**: The anonymous key can access the schedule_items table. RLS policies should be implemented to restrict access.`
      : `Both keys are having issues accessing the table. Check Supabase configuration.`
}

${
  results.serviceRoleTests.calendarFields?.success
    ? `The service role key can access calendar-related fields, which is required for the calendar sync functionality.`
    : `**CRITICAL ISSUE**: The service role key cannot access calendar-related fields. This will prevent calendar sync from working.`
}

## Temporary RLS Policy Adjustments

If RLS policies are blocking the service role key (which should have bypass capabilities), you can temporarily use the following SQL:

\`\`\`sql
-- Temporarily disable RLS on schedule_items
ALTER TABLE schedule_items DISABLE ROW LEVEL SECURITY;

-- Alternative: Create a policy that allows service role to bypass RLS
CREATE POLICY "service_role_bypass" ON schedule_items
  USING (auth.jwt() ->> 'role' = 'service_role');
\`\`\`

**Note**: After confirming functionality, consider reinstating RLS with proper policies.
`;

    fs.writeFileSync('RLS_CHECK.md', rlsCheckContent);
    console.log('RLS check results saved to RLS_CHECK.md');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
