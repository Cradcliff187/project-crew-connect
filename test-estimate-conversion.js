import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDraftEstimateConversion() {
  try {
    // Get a draft estimate
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('status', 'draft')
      .is('projectid', null) // Only get unconverted estimates
      .limit(1);

    if (estError) {
      console.error('Error fetching draft estimates:', estError);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No draft estimates available for testing');
      // Try to find any unconverted estimate instead
      const { data: anyEstimates, error: anyError } = await supabase
        .from('estimates')
        .select('estimateid, status, projectid')
        .is('projectid', null)
        .limit(1);

      if (anyError || !anyEstimates || anyEstimates.length === 0) {
        console.log('No unconverted estimates available at all');
        return;
      }

      console.log(
        `No draft estimates found. Testing with a ${anyEstimates[0].status} estimate instead.`
      );
      estimates[0] = anyEstimates[0];
    }

    const testEstimateId = estimates[0].estimateid;
    console.log(`Testing conversion with ${estimates[0].status} estimate ID: ${testEstimateId}`);

    // Try the conversion
    console.log('Converting estimate to project...');
    const { data: projectId, error: convError } = await supabase.rpc(
      'convert_estimate_to_project',
      {
        p_estimate_id: testEstimateId,
      }
    );

    if (convError) {
      console.error('Conversion failed:', convError);
      return;
    }

    console.log(`✅ Conversion successful! New project ID: ${projectId}`);

    // Verify the estimate was updated
    const { data: postEstimate, error: postError } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimateid', testEstimateId)
      .single();

    if (postError) {
      console.error('Error getting post-conversion details:', postError);
      return;
    }

    console.log('Post-conversion estimate details:');
    console.log(`- ID: ${postEstimate.estimateid}`);
    console.log(`- Status: ${postEstimate.status}`);
    console.log(`- ProjectID: ${postEstimate.projectid || 'null'}`);

    if (postEstimate.status === 'converted' && postEstimate.projectid === projectId) {
      console.log(
        '✅ VALIDATION PASSED: Estimate updated correctly with converted status and project link'
      );
    } else {
      console.log('❌ VALIDATION FAILED: Estimate not updated correctly');
    }
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

testDraftEstimateConversion();
