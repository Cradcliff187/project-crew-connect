import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusChanges() {
  try {
    // Get a draft estimate
    console.log('Looking for a draft estimate...');
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
      return;
    }

    const estimateId = estimates[0].estimateid;
    console.log(`Found draft estimate: ${estimateId}`);

    // Test 1: Change directly from draft to approved (should work with new validation)
    console.log('\nTest 1: Changing from draft to approved...');
    const { error: approvedError } = await supabase
      .from('estimates')
      .update({ status: 'approved' })
      .eq('estimateid', estimateId);

    if (approvedError) {
      console.error('❌ FAILED: Status change to approved:', approvedError.message);
    } else {
      console.log('✅ SUCCESS: Status changed to approved');
    }

    // Test 2: Convert to project
    console.log('\nTest 2: Converting to project...');
    const { data: projectId, error: convError } = await supabase.rpc(
      'convert_estimate_to_project',
      {
        p_estimate_id: estimateId,
      }
    );

    if (convError) {
      console.error('❌ FAILED: Conversion to project:', convError.message);
    } else {
      console.log(`✅ SUCCESS: Converted to project ${projectId}`);
    }

    // Test 3: Try to change a converted estimate (should fail)
    console.log('\nTest 3: Trying to change a converted estimate...');
    const { error: changeConvertedError } = await supabase
      .from('estimates')
      .update({ status: 'approved' })
      .eq('estimateid', estimateId);

    if (changeConvertedError) {
      console.log(`✅ EXPECTED FAILURE: ${changeConvertedError.message}`);
    } else {
      console.error('❌ UNEXPECTED SUCCESS: Should not be able to change converted estimate');
    }

    // If test 2 failed, revert estimate to draft for next run
    if (convError) {
      console.log('\nResetting estimate to draft for next test...');
      await supabase.from('estimates').update({ status: 'draft' }).eq('estimateid', estimateId);
      console.log('Reset complete');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testStatusChanges();
