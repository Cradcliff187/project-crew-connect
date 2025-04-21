import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctionDefinition() {
  try {
    console.log('Checking function definition in the database...');

    // Direct query to pg_proc to get function definition
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'convert_estimate_to_project')
      .limit(1);

    if (error) {
      console.error('Error querying function definition:', error);

      // Try alternative approach
      console.log('\nTrying with direct SQL query...');

      // Query information_schema.routines
      const { data: routineData, error: routineError } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_definition')
        .eq('routine_name', 'convert_estimate_to_project')
        .limit(1);

      if (routineError) {
        console.error('Error with second approach:', routineError);
      } else if (routineData && routineData.length > 0) {
        console.log('Found function definition:', routineData[0].routine_definition);
      } else {
        console.log('Function not found in information_schema.routines');
      }
    } else if (data && data.length > 0) {
      console.log('Found function definition:', data[0].prosrc);
    } else {
      console.log('Function not found');
    }

    // Test the function with a direct RPC call and check the error
    console.log('\nTesting function with direct RPC call...');

    const { data: rpcData, error: rpcError } = await supabase.rpc('convert_estimate_to_project', {
      p_estimate_id: 'FAKE-ID-FOR-TESTING',
    });

    if (rpcError) {
      console.log('RPC call error:', rpcError);
      console.log('Error message type:', typeof rpcError.message);
      console.log('Error message:', rpcError.message);

      if (rpcError.message.includes('quantity')) {
        console.log(
          '\nERROR ANALYSIS: The function still contains references to the "quantity" column'
        );
        console.log('Make sure you applied the latest SQL that removes references to this column');
      } else if (rpcError.message.includes('Estimate not found')) {
        console.log('\nSUCCESS: The function is properly updated and working!');
      }
    } else {
      console.log('Unexpected success with fake ID:', rpcData);
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

checkFunctionDefinition();
