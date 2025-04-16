// Direct conversion script for estimate EST-364978
// Copy and paste this into your browser console when logged into the app

(async function () {
  // Function to check and report estimate status
  async function checkEstimate(estimateId) {
    console.log(`Checking estimate ${estimateId}...`);

    try {
      const { data, error } = await window.supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimateId)
        .single();

      if (error) {
        console.error('Error checking estimate:', error);
        return null;
      }

      console.log('ESTIMATE FOUND:', {
        id: data.estimateid,
        status: data.status,
        project: data.projectname,
        client: data.customerid || data.customername,
        projectId: data.projectid || 'Not linked to a project',
      });

      console.log('FULL DATA:', data);
      return data;
    } catch (err) {
      console.error('Exception checking estimate:', err);
      return null;
    }
  }

  // Step 1: Check current estimate
  const estimateId = 'EST-364978';
  const estimate = await checkEstimate(estimateId);

  if (!estimate) {
    console.error('❌ Cannot proceed: Estimate not found');
    return;
  }

  if (estimate.projectid) {
    console.log('✅ Estimate is already linked to project:', estimate.projectid);
    return;
  }

  // Step 2: Update status to pending
  if (estimate.status === 'draft') {
    console.log('Updating status from draft to pending...');
    const { error: pendingError } = await window.supabase
      .from('estimates')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('estimateid', estimateId);

    if (pendingError) {
      console.error('❌ Failed to update to pending:', pendingError);
      return;
    }

    console.log('✅ Status updated to pending');

    // Wait for database
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 3: Update status to approved
  if (estimate.status === 'draft' || estimate.status === 'pending' || estimate.status === 'sent') {
    console.log(`Updating status from ${estimate.status} to approved...`);
    const { error: approvedError } = await window.supabase
      .from('estimates')
      .update({
        status: 'approved',
        approveddate: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('estimateid', estimateId);

    if (approvedError) {
      console.error('❌ Failed to update to approved:', approvedError);
      return;
    }

    console.log('✅ Status updated to approved');

    // Wait for database
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 4: Create project
  console.log('Creating project...');
  const projectData = {
    customerid: estimate.customerid,
    customername: estimate.customername,
    projectname: estimate.projectname || `Project from ${estimate.estimateid}`,
    jobdescription: estimate['job description'] || '', // Note the space
    status: 'active',
    sitelocationaddress: estimate.sitelocationaddress || '',
    sitelocationcity: estimate.sitelocationcity || '',
    sitelocationstate: estimate.sitelocationstate || '',
    sitelocationzip: estimate.sitelocationzip || '',
    createdon: new Date().toISOString(),
    total_budget: estimate.estimateamount || 0,
  };

  const { data: project, error: projectError } = await window.supabase
    .from('projects')
    .insert([projectData])
    .select();

  if (projectError) {
    console.error('❌ Failed to create project:', projectError);
    return;
  }

  if (!project || project.length === 0) {
    console.error('❌ No project was created');
    return;
  }

  console.log('✅ Project created:', project[0]);

  // Step 5: Link estimate to project
  console.log('Linking estimate to project...');
  const { error: linkError } = await window.supabase
    .from('estimates')
    .update({
      projectid: project[0].projectid,
      status: 'converted',
      updated_at: new Date().toISOString(),
    })
    .eq('estimateid', estimateId);

  if (linkError) {
    console.error('❌ Failed to link estimate to project:', linkError);
    return;
  }

  console.log('✅ Estimate successfully linked to project');

  // Step 6: Final verification
  const finalEstimate = await checkEstimate(estimateId);
  if (
    finalEstimate &&
    finalEstimate.projectid === project[0].projectid &&
    finalEstimate.status === 'converted'
  ) {
    console.log('🎉 SUCCESS: Estimate has been converted and linked to project');
  } else {
    console.error('❌ Verification failed. Please check status manually.');
  }
})();
