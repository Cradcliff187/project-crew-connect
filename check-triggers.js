import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggersAndFunctions() {
  try {
    console.log('Checking database triggers and functions...');

    // Use RPC if available
    try {
      console.log('\nAttempting to use list_triggers RPC function...');
      const { data: triggers, error: triggerError } = await supabase.rpc('list_triggers');

      if (triggerError) {
        console.log('RPC method not available:', triggerError.message);
      } else {
        console.log('Triggers on the database:');
        console.log(triggers);
      }
    } catch (e) {
      console.log('Error checking triggers via RPC:', e.message);
    }

    // Try direct query to information_schema
    try {
      console.log('\nQuerying information_schema for triggers...');
      const { data: triggerInfo, error: infoError } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, action_statement')
        .eq('trigger_schema', 'public')
        .limit(10);

      if (infoError) {
        console.log('Error querying information_schema:', infoError.message);
      } else if (triggerInfo && triggerInfo.length > 0) {
        console.log('Triggers found:');
        triggerInfo.forEach(t => {
          console.log(`- ${t.trigger_name} (${t.event_manipulation})`);
        });
      } else {
        console.log('No triggers found in information_schema');
      }
    } catch (e) {
      console.log('Error with information_schema query:', e.message);
    }

    // Check if we can drop and recreate the trigger
    console.log("\nLet's try a direct SQL command to check if the validation function exists...");

    // Test a simple query to verify connection
    const { error: testError } = await supabase.from('estimates').select('estimateid').limit(1);

    if (testError) {
      console.log('Error with test query:', testError.message);
    } else {
      console.log('Database connection is working');
    }

    // Using pg_dump directly is not possible through browser/JavaScript APIs.
    // Let's try an alternative approach to get the source for validation function:
    console.log('\nChecking for valid status transitions in current implementation...');

    // Create a test estimate (or find an existing one)
    const { data: testEstimate, error: createError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .eq('status', 'draft')
      .limit(1);

    if (createError || !testEstimate || testEstimate.length === 0) {
      console.log('Could not find a test estimate');
      return;
    }

    console.log(`Using estimate ${testEstimate[0].estimateid} for transition tests`);

    // Test all possible transitions
    const allStatuses = ['draft', 'pending', 'sent', 'approved', 'rejected', 'converted'];

    // Try changing from draft to each status
    for (const newStatus of allStatuses) {
      if (newStatus === 'draft') continue; // Skip same status

      console.log(`Testing transition draft → ${newStatus}...`);
      const { error: transError } = await supabase
        .from('estimates')
        .update({ status: newStatus })
        .eq('estimateid', testEstimate[0].estimateid)
        .eq('status', 'draft');

      if (transError) {
        console.log(`❌ NOT ALLOWED: ${transError.message}`);
      } else {
        console.log('✅ ALLOWED');

        // Reset back to draft
        await supabase
          .from('estimates')
          .update({ status: 'draft' })
          .eq('estimateid', testEstimate[0].estimateid);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTriggersAndFunctions();
