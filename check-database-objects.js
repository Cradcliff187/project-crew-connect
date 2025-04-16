import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseObjects() {
  try {
    // Check for the estimate_status type (enum type)
    console.log('Looking for database objects...');

    // Let's try to run a direct SQL query to inspect the database
    try {
      // Try getting information from the built-in function
      const { data: existingFunction, error: functionError } = await supabase.rpc(
        'get_function_source',
        {
          function_name: 'validate_estimate_status_transition',
        }
      );

      if (functionError) {
        console.log('Error checking function source via RPC:', functionError.message);
      } else if (existingFunction) {
        console.log('Found existing validation function:');
        console.log(existingFunction);
      }
    } catch (e) {
      console.log('Error checking function source:', e.message);
    }

    // Directly try to modify a draft estimate to see the exact error
    console.log('\nAttempting direct status change to diagnose the issue...');

    // Find a draft estimate
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid')
      .eq('status', 'draft')
      .is('projectid', null)
      .limit(1);

    if (estError || !estimates || estimates.length === 0) {
      console.log('No draft estimates found to test with');
      return;
    }

    // Try changing status directly and capture the full error
    const estimateId = estimates[0].estimateId;
    console.log(`Using estimate ID: ${estimateId || estimates[0].estimateid}`);

    // Try to update to each possible status
    const statusOptions = ['sent', 'approved', 'rejected', 'converted', 'pending'];

    for (const status of statusOptions) {
      try {
        console.log(`\nTrying to change to ${status}...`);
        const { error } = await supabase
          .from('estimates')
          .update({ status })
          .eq('estimateid', estimateId || estimates[0].estimateid);

        if (error) {
          console.log(`❌ Failed: ${error.message}`);
          console.log('Error details:', error);
        } else {
          console.log('✅ Succeeded!');

          // Reset back to draft
          await supabase
            .from('estimates')
            .update({ status: 'draft' })
            .eq('estimateid', estimateId || estimates[0].estimateid);
        }
      } catch (e) {
        console.log(`Error trying to change to ${status}:`, e);
      }
    }

    // Check other database objects that might be enforcing constraints
    console.log('\nChecking for enum type constraint...');

    // Try a direct update bypassing the ORM
    try {
      const { error: bypassError } = await supabase.rpc('exec_sql', {
        sql_string: `
          UPDATE estimates
          SET status = 'approved'::text
          WHERE estimateid = '${estimateId || estimates[0].estimateid}'
        `,
      });

      if (bypassError) {
        console.log('Error with bypass update:', bypassError.message);
      } else {
        console.log(
          'Bypass update successful! This suggests a trigger is enforcing the constraint.'
        );
      }
    } catch (e) {
      console.log('Error with bypass attempt:', e.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseObjects();
