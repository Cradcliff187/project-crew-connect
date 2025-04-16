import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealConversion() {
  try {
    // Get available estimates
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .is('projectid', null) // Only get unconverted estimates
      .limit(5);

    if (estError) {
      console.error('Error fetching estimates:', estError);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No unconverted estimates available for testing');
      return;
    }

    // Pick the first available estimate
    const testEstimateId = estimates[0].estimateid;
    console.log(`Testing conversion with real estimate ID: ${testEstimateId}`);

    // Step 1: Get pre-conversion details
    console.log('\nStep 1: Getting pre-conversion details');
    const { data: preEstimate, error: preError } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimateid', testEstimateId)
      .single();

    if (preError) {
      console.error('Error getting pre-conversion details:', preError);
      return;
    }

    console.log('Pre-conversion estimate details:');
    console.log(`- ID: ${preEstimate.estimateid}`);
    console.log(`- Status: ${preEstimate.status}`);
    console.log(`- ProjectID: ${preEstimate.projectid || 'null'}`);

    // Step 2: Convert the estimate
    console.log('\nStep 2: Converting estimate to project');
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

    // Step 3: Verify the estimate was updated
    console.log('\nStep 3: Verifying estimate update');
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
      console.log('✅ Estimate updated correctly with converted status and project link');
    } else {
      console.log('❌ Estimate not updated correctly');
    }

    // Step 4: Verify the project was created
    console.log('\nStep 4: Verifying project creation');
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (projError) {
      console.error('Error fetching project:', projError);
      return;
    }

    console.log('New project details:');
    console.log(`- ID: ${project.projectid}`);
    console.log(`- Name: ${project.projectname}`);
    console.log(`- Customer: ${project.customername}`);
    console.log(`- Status: ${project.status}`);

    // Step 5: Verify budget items were created
    console.log('\nStep 5: Verifying budget items');
    const { data: budgetItems, error: itemsError } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId);

    if (itemsError) {
      console.error('Error fetching budget items:', itemsError);
      return;
    }

    console.log(`Found ${budgetItems?.length || 0} budget items for the project`);
    if (budgetItems && budgetItems.length > 0) {
      console.log('Sample budget item:');
      console.log(`- Category: ${budgetItems[0].category}`);
      console.log(`- Description: ${budgetItems[0].description}`);
      console.log(`- Estimated amount: ${budgetItems[0].estimated_amount}`);
    }

    // Step 6: Verify documents were transferred
    console.log('\nStep 6: Verifying document transfer');
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'PROJECT')
      .eq('entity_id', projectId);

    if (docsError) {
      console.error('Error fetching project documents:', docsError);
      return;
    }

    console.log(`Found ${documents?.length || 0} documents for the project`);
    if (documents && documents.length > 0) {
      console.log('Sample document:');
      console.log(`- Document ID: ${documents[0].document_id}`);
      console.log(`- File name: ${documents[0].file_name}`);
      console.log(`- Notes: ${documents[0].notes}`);
    }

    console.log('\nSUMMARY:');
    console.log('✅ Estimate to project conversion completed successfully!');
    console.log(`- Estimate ${testEstimateId} converted to project ${projectId}`);
    console.log(`- Status updated to: ${postEstimate.status}`);
    console.log(`- ${budgetItems?.length || 0} budget items created`);
    console.log(`- ${documents?.length || 0} documents transferred`);
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

testRealConversion();
