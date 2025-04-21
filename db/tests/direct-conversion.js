import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function directConversionInJs() {
  try {
    // Get an estimate to convert
    console.log('Looking for an unconverted estimate...');
    const { data: estimates, error: findError } = await supabase
      .from('estimates')
      .select('*') // Get all fields
      .is('projectid', null) // Not converted yet
      .limit(1);

    if (findError) {
      console.error('Error finding estimate:', findError.message);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No unconverted estimates found');
      return;
    }

    const estimate = estimates[0];
    console.log(`Found estimate ${estimate.estimateid} with status: ${estimate.status}`);

    // Step 1: Update to approved status if needed
    if (estimate.status !== 'approved') {
      console.log('Updating estimate to approved status...');

      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          status: 'approved',
          approveddate: new Date().toISOString(),
        })
        .eq('estimateid', estimate.estimateid);

      if (updateError) {
        console.error('Failed to update status:', updateError.message);
        return;
      }

      console.log('Status updated to approved');
    }

    // Step 2: Generate a unique project ID
    const projectId = 'PRJ-' + Math.floor(Math.random() * 1000000).toString();

    // Step 3: Create the project
    console.log('Creating project...');

    // Get job description from field with space if it exists
    const jobDescription =
      estimate['job description'] || 'Project converted from estimate ' + estimate.estimateid;

    const projectData = {
      projectid: projectId,
      customername: estimate.customername,
      projectname: estimate.projectname || 'Project from ' + estimate.estimateid,
      jobdescription: jobDescription,
      status: 'active',
      sitelocationaddress: estimate.sitelocationaddress,
      sitelocationcity: estimate.sitelocationcity,
      sitelocationstate: estimate.sitelocationstate,
      sitelocationzip: estimate.sitelocationzip,
      createdon: new Date().toISOString(),
      total_budget: estimate.estimateamount,
    };

    const { error: projectError } = await supabase.from('projects').insert([projectData]);

    if (projectError) {
      console.error('Failed to create project:', projectError.message);
      return;
    }

    console.log(`Project created with ID: ${projectId}`);

    // Step 4: Update the estimate to link it to the project and mark as converted
    console.log('Updating estimate to converted status...');

    const { error: convertError } = await supabase
      .from('estimates')
      .update({
        status: 'converted',
        projectid: projectId,
      })
      .eq('estimateid', estimate.estimateid);

    if (convertError) {
      console.error('Failed to convert estimate:', convertError.message);
      return;
    }

    console.log('Estimate successfully converted to project!');

    // Verify final status
    const { data: finalState, error: finalError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimate.estimateid)
      .single();

    if (finalError) {
      console.error('Error fetching final state:', finalError.message);
    } else {
      console.log('\nFinal estimate state:');
      console.log(`Status: ${finalState.status}`);
      console.log(`Project ID: ${finalState.projectid}`);
    }

    // Final verification
    if (finalState && finalState.status === 'converted' && finalState.projectid === projectId) {
      console.log(
        '\n✅ CONVERSION SUCCESSFUL! The estimate has been properly converted to a project.'
      );
    } else {
      console.log('\n❌ CONVERSION VERIFICATION FAILED. Check the database for issues.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

directConversionInJs();
