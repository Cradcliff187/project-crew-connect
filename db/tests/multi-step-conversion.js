import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function manualStepByStepConversion() {
  try {
    // Get a draft estimate
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select(
        'estimateid, status, projectid, customername, customerid, projectname, estimateamount, sitelocationaddress, sitelocationcity, sitelocationstate, sitelocationzip, "job description", jobdescription'
      )
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

    const estimate = estimates[0];
    const estimateId = estimate.estimateid;
    console.log(`Testing multi-step conversion with draft estimate ID: ${estimateId}`);
    console.log(`Initial status: ${estimate.status}`);

    // Step 1: Change from draft to pending
    console.log('\nStep 1: Changing status from draft to pending...');
    let { error: pendingError } = await supabase
      .from('estimates')
      .update({ status: 'pending' })
      .eq('estimateid', estimateId);

    if (pendingError) {
      console.error('Error updating to pending:', pendingError);
      return;
    }

    console.log('Status updated to pending');

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Change from pending to approved
    console.log('\nStep 2: Changing status from pending to approved...');
    let { error: approvedError } = await supabase
      .from('estimates')
      .update({
        status: 'approved',
        approveddate: new Date().toISOString(),
      })
      .eq('estimateid', estimateId);

    if (approvedError) {
      console.error('Error updating to approved:', approvedError);
      return;
    }

    console.log('Status updated to approved');

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Create the project
    console.log('\nStep 3: Creating project...');

    // Generate a unique projectId
    const projectId = 'PROJ-' + Math.floor(Math.random() * 1000000).toString();

    // Create project
    const projectData = {
      projectid: projectId,
      customerid: estimate.customerid,
      customername: estimate.customername,
      projectname: estimate.projectname || `Project from ${estimateId}`,
      jobdescription:
        estimate['job description'] ||
        estimate.jobdescription ||
        `Created from estimate ${estimateId}`,
      status: 'active',
      sitelocationaddress: estimate.sitelocationaddress || '',
      sitelocationcity: estimate.sitelocationcity || '',
      sitelocationstate: estimate.sitelocationstate || '',
      sitelocationzip: estimate.sitelocationzip || '',
      createdon: new Date().toISOString(),
      total_budget: estimate.estimateamount || 0,
    };

    const { error: projectError } = await supabase.from('projects').insert([projectData]);

    if (projectError) {
      console.error('Error creating project:', projectError);
      return;
    }

    console.log(`Project created with ID: ${projectId}`);

    // Step 4: Update estimate to converted status and link project
    console.log('\nStep 4: Updating estimate to converted status...');
    let { error: convertedError } = await supabase
      .from('estimates')
      .update({
        status: 'converted',
        projectid: projectId,
      })
      .eq('estimateid', estimateId);

    if (convertedError) {
      console.error('Error updating to converted:', convertedError);
      return;
    }

    console.log('Status updated to converted and linked to project');

    // Step 5: Verify the conversion
    console.log('\nStep 5: Verifying conversion...');
    const { data: finalEstimate, error: finalError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimateId)
      .single();

    if (finalError) {
      console.error('Error fetching final estimate:', finalError);
      return;
    }

    console.log('Final estimate state:');
    console.log(`- ID: ${finalEstimate.estimateid}`);
    console.log(`- Status: ${finalEstimate.status}`);
    console.log(`- ProjectID: ${finalEstimate.projectid}`);

    if (finalEstimate.status === 'converted' && finalEstimate.projectid === projectId) {
      console.log('\n✅ CONVERSION SUCCESSFUL!');
      console.log('The estimate has been properly converted to a project.');
    } else {
      console.log('\n❌ CONVERSION VERIFICATION FAILED');
      console.log('The estimate was not properly converted.');
    }
  } catch (error) {
    console.error('Unexpected error during conversion:', error);
  }
}

manualStepByStepConversion();
