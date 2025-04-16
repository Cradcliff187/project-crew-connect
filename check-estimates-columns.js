import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnsStructure() {
  try {
    console.log('Checking the actual structure of the estimates table...');

    // Get a sample estimate
    const { data: estimate, error } = await supabase
      .from('estimates')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching a sample estimate:', error);
      return;
    }

    // Print all column names and their values
    console.log('Estimate columns:');
    for (const [key, value] of Object.entries(estimate)) {
      console.log(`- ${key}: ${value}`);
    }

    // Check which job description field exists
    console.log('\nChecking job description field:');
    if ('job_description' in estimate) {
      console.log('✅ Column "job_description" exists');
    } else if ('jobdescription' in estimate) {
      console.log('✅ Column "jobdescription" exists');
    } else if ('job description' in estimate) {
      console.log('✅ Column "job description" exists (with space)');
    } else {
      console.log('❌ No job description column found');
    }

    // Now check if there's a convert_estimate_to_project function
    console.log('\nAttempting to check for convert_estimate_to_project function:');
    try {
      // Try a call to the function with an invalid ID to see if it exists
      await supabase.rpc('convert_estimate_to_project', {
        p_estimate_id: 'non-existent-id',
      });
    } catch (funcError) {
      if (funcError.message && funcError.message.includes('not exist')) {
        console.log('❌ Function does not exist: ', funcError.message);
      } else {
        console.log('✅ Function exists but returned error for non-existent ID');
      }
    }

    // Try listing all functions in the database
    console.log('\nListing available RPC functions:');
    await supabase
      .rpc('list_functions')
      .then(({ data, error }) => {
        if (error) {
          console.log('Error listing functions (list_functions not available):', error.message);
        } else {
          console.log('Available functions:', data);
        }
      })
      .catch(err => {
        console.log('Cannot list functions:', err.message);
      });
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

checkColumnsStructure();
