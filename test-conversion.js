import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversion() {
  try {
    // Find an estimate that isn't converted yet
    console.log('Finding an unconverted estimate...');
    const { data: estimates, error: findError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .is('projectid', null) // Not yet converted
      .limit(1);

    if (findError) {
      console.error('Error finding estimate:', findError.message);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No unconverted estimates available for testing');
      return;
    }

    const estimateId = estimates[0].estimateid;
    console.log(`Using estimate ${estimateId} with status: ${estimates[0].status}`);

    // Make sure it's in approved status
    if (estimates[0].status !== 'approved') {
      console.log(`\nChanging status to approved first...`);
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'approved' })
        .eq('estimateid', estimateId);

      if (updateError) {
        console.error(`❌ Failed to update status: ${updateError.message}`);
        return;
      }
      console.log('✅ Status updated to approved');
    }

    // Try the conversion function
    console.log('\nConverting to project...');
    const { data: projectId, error: convError } = await supabase.rpc(
      'convert_estimate_to_project',
      {
        p_estimate_id: estimateId,
      }
    );

    if (convError) {
      console.error(`❌ Conversion failed: ${convError.message}`);
    } else {
      console.log(`✅ Conversion successful! New project ID: ${projectId}`);
    }

    // Verify final state
    const { data: finalState, error: finalError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimateId)
      .single();

    if (finalError) {
      console.error('Error checking final state:', finalError.message);
    } else {
      console.log('\nFinal estimate state:');
      console.log(`Status: ${finalState.status}`);
      console.log(`Project ID: ${finalState.projectid || 'none'}`);
    }

    // Check the created project
    if (finalState?.projectid) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', finalState.projectid)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError.message);
      } else {
        console.log('\nCreated project details:');
        console.log(`ID: ${project.projectid}`);
        console.log(`Name: ${project.projectname}`);
        console.log(`Status: ${project.status}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConversion();
