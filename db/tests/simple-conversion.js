import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// First just look at the table structure to understand column names
async function simpleConversion() {
  try {
    // First get one record to understand the structure
    console.log('Getting sample estimate to understand table structure...');
    const { data: sample, error: sampleError } = await supabase
      .from('estimates')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      return;
    }

    if (!sample || sample.length === 0) {
      console.log('No estimates available');
      return;
    }

    // Log the column names we have
    console.log('Available columns:');
    console.log(Object.keys(sample[0]));

    // Get a draft estimate using only essential fields
    console.log('\nLooking for a draft estimate...');
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
    console.log(`Testing with draft estimate ID: ${estimateId}`);

    // Step 1: First try to update the status from draft to pending
    console.log('\nStep 1: Updating status draft → pending');
    const { error: pendingError } = await supabase
      .from('estimates')
      .update({ status: 'pending' })
      .eq('estimateid', estimateId);

    if (pendingError) {
      console.error('Error updating to pending:', pendingError);
      return;
    }
    console.log('Successfully updated to pending');

    // Add a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Then update from pending to approved
    console.log('\nStep 2: Updating status pending → approved');
    const { error: approvedError } = await supabase
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
    console.log('Successfully updated to approved');

    // Add a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Finally update from approved to converted with project link
    console.log('\nStep 3: Creating simplified project');
    const projectId = 'PROJ-' + Math.floor(Math.random() * 1000000).toString();

    const { error: projectError } = await supabase.from('projects').insert([
      {
        projectid: projectId,
        projectname: `Project from ${estimateId}`,
        status: 'active',
        createdon: new Date().toISOString(),
      },
    ]);

    if (projectError) {
      console.error('Error creating project:', projectError);
      return;
    }
    console.log(`Project created with ID: ${projectId}`);

    // Add a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Update to converted and link to project
    console.log('\nStep 4: Updating status approved → converted with project link');
    const { error: convertedError } = await supabase
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
    console.log('Successfully updated to converted and linked to project');

    // Verify final state
    const { data: final, error: finalError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimateId)
      .single();

    if (finalError) {
      console.error('Error fetching final state:', finalError);
      return;
    }

    console.log('\nFinal state:');
    console.log(`- Status: ${final.status}`);
    console.log(`- Project Link: ${final.projectid}`);

    if (final.status === 'converted' && final.projectid === projectId) {
      console.log('\n✅ CONVERSION SUCCESSFUL!');
    } else {
      console.log('\n❌ CONVERSION FAILED');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

simpleConversion();
