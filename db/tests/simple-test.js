import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
  try {
    // Find a draft estimate
    const { data: estimates, error: findError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .eq('status', 'draft')
      .is('projectid', null)
      .limit(1);

    if (findError) {
      console.error('Error finding estimate:', findError.message);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No draft estimates available for testing');
      return;
    }

    const estimateId = estimates[0].estimateid;
    console.log(`Using estimate ${estimateId} with status: ${estimates[0].status}`);

    // Try direct transition from draft to converted
    console.log('\nTesting if we can change from draft to approved directly:');
    const { error: approvedError } = await supabase
      .from('estimates')
      .update({ status: 'approved' })
      .eq('estimateid', estimateId);

    if (approvedError) {
      console.log(`❌ FAILED: ${approvedError.message}`);
    } else {
      console.log('✅ SUCCESS: Status changed to approved!');
    }

    // Try the conversion function
    console.log('\nTesting the convert_estimate_to_project function:');
    const { data: projectId, error: convError } = await supabase.rpc(
      'convert_estimate_to_project',
      {
        p_estimate_id: estimateId,
      }
    );

    if (convError) {
      console.log(`❌ FAILED: ${convError.message}`);
    } else {
      console.log(`✅ SUCCESS: Converted to project ${projectId}!`);
    }

    // Verify final state
    const { data: finalState, error: finalError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimateId)
      .single();

    if (finalError) {
      console.log('Error checking final state:', finalError.message);
    } else {
      console.log('\nFinal state:');
      console.log(`Status: ${finalState.status}`);
      console.log(`Project ID: ${finalState.projectid || 'none'}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

simpleTest();
