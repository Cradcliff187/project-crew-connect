import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversion() {
  try {
    // Step 1: Get an estimate ID to use
    console.log('Fetching an estimate to convert...');
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, projectid, status')
      .limit(10);

    if (estError) {
      console.error('Error fetching estimates:', estError);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No estimates found to test with');
      return;
    }

    // Find an estimate that hasn't been converted yet
    console.log('Available estimates:');
    estimates.forEach(est => {
      console.log(
        `ID: ${est.estimateid}, Status: ${est.status}, ProjectID: ${est.projectid || 'null'}`
      );
    });

    const testEstimate = estimates.find(est => !est.projectid && est.status !== 'converted');

    if (!testEstimate) {
      console.log('No unconverted estimates found for testing');
      return;
    }

    console.log(`\nTesting with estimate ID: ${testEstimate.estimateid}`);

    // Step 2: Try to directly call the function
    console.log('\nCalling convert_estimate_to_project function directly...');

    const { data, error } = await supabase.rpc('convert_estimate_to_project', {
      p_estimate_id: testEstimate.estimateid,
    });

    if (error) {
      console.error('Error calling function:', error);
    } else {
      console.log('Function call successful:', data);

      // Verify the project was created
      console.log('\nVerifying project creation...');
      const { data: project, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', data)
        .single();

      if (projError) {
        console.error('Error fetching created project:', projError);
      } else {
        console.log('Project created successfully:', project);
      }

      // Verify the estimate was updated
      console.log('\nVerifying estimate update...');
      const { data: updatedEst, error: updateError } = await supabase
        .from('estimates')
        .select('estimateid, status, projectid')
        .eq('estimateid', testEstimate.estimateid)
        .single();

      if (updateError) {
        console.error('Error fetching updated estimate:', updateError);
      } else {
        console.log('Estimate updated successfully:', updatedEst);
      }
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the test
testConversion();
