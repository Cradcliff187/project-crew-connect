// Script to directly fix the estimate conversion issue for EST-364978
// Uses the Supabase client directly to make necessary changes

import { supabase } from '../integrations/supabase/client';

/**
 * Function to check estimate status and details
 */
async function checkEstimateStatus(estimateId) {
  console.log(`Checking estimate ${estimateId}...`);

  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimateid', estimateId)
      .single();

    if (error) {
      console.error('Error fetching estimate:', error);
      return null;
    }

    console.log('Estimate found:', {
      id: data.estimateid,
      status: data.status,
      project: data.projectname,
      client: data.customerid || data.customername,
      projectId: data.projectid || 'Not linked to a project',
      createdOn: data.datecreated,
    });

    return data;
  } catch (err) {
    console.error('Exception checking estimate:', err);
    return null;
  }
}

/**
 * Function to update an estimate's status
 */
async function updateStatus(estimateId, newStatus) {
  console.log(`Updating estimate ${estimateId} status to ${newStatus}...`);

  try {
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Add appropriate date fields
    if (newStatus === 'sent') {
      updateData.sentdate = new Date().toISOString();
    } else if (newStatus === 'approved') {
      updateData.approveddate = new Date().toISOString();
    }

    const { error } = await supabase
      .from('estimates')
      .update(updateData)
      .eq('estimateid', estimateId);

    if (error) {
      console.error('Error updating status:', error);
      return false;
    }

    console.log(`Status updated to ${newStatus} successfully`);
    return true;
  } catch (err) {
    console.error('Exception updating status:', err);
    return false;
  }
}

/**
 * Function to create a project from an estimate
 */
async function createProject(estimate) {
  console.log(`Creating project from estimate ${estimate.estimateid}...`);

  try {
    // Prepare project data
    const projectData = {
      customerid: estimate.customerid,
      customername: estimate.customername,
      projectname: estimate.projectname || `Project from ${estimate.estimateid}`,
      jobdescription: estimate['job description'] || '', // Note the space in field name
      status: 'active',
      sitelocationaddress: estimate.sitelocationaddress || '',
      sitelocationcity: estimate.sitelocationcity || '',
      sitelocationstate: estimate.sitelocationstate || '',
      sitelocationzip: estimate.sitelocationzip || '',
      createdon: new Date().toISOString(),
      total_budget: estimate.estimateamount || 0,
    };

    // Create the project
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    if (!newProject || newProject.length === 0) {
      console.error('No project created');
      return null;
    }

    console.log('Project created successfully:', newProject[0]);
    return newProject[0];
  } catch (err) {
    console.error('Exception creating project:', err);
    return null;
  }
}

/**
 * Function to link an estimate to a project and set status to converted
 */
async function linkEstimateToProject(estimateId, projectId) {
  console.log(`Linking estimate ${estimateId} to project ${projectId}...`);

  try {
    const { error } = await supabase
      .from('estimates')
      .update({
        projectid: projectId,
        status: 'converted',
        updated_at: new Date().toISOString(),
      })
      .eq('estimateid', estimateId);

    if (error) {
      console.error('Error linking estimate to project:', error);
      return false;
    }

    console.log('Estimate linked to project successfully');
    return true;
  } catch (err) {
    console.error('Exception linking estimate to project:', err);
    return false;
  }
}

/**
 * Main function to fix the estimate conversion issue
 */
async function fixEstimateConversion(estimateId) {
  console.log(`Starting fix for estimate ${estimateId}...`);

  // Step 1: Check the current state of the estimate
  let estimate = await checkEstimateStatus(estimateId);
  if (!estimate) {
    console.log('Cannot proceed without estimate data');
    return;
  }

  // Step 2: If already linked to a project, we're done
  if (estimate.projectid) {
    console.log(`Estimate already linked to project ${estimate.projectid}`);
    return;
  }

  // Step 3: Handle status transitions as needed
  if (estimate.status === 'draft') {
    console.log('Estimate is in draft status, transitioning to pending...');
    const pendingResult = await updateStatus(estimateId, 'pending');
    if (!pendingResult) {
      console.log('Failed to transition to pending status, aborting');
      return;
    }

    // Wait a moment for the database to process
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Transitioning from pending to approved...');
    const approvedResult = await updateStatus(estimateId, 'approved');
    if (!approvedResult) {
      console.log('Failed to transition to approved status, aborting');
      return;
    }

    // Wait again for the database to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh our estimate data
    const updatedEstimate = await checkEstimateStatus(estimateId);
    if (!updatedEstimate || updatedEstimate.status !== 'approved') {
      console.log('Failed to verify approved status, aborting');
      return;
    }

    // Continue with the updated estimate data
    estimate = updatedEstimate;
  } else if (estimate.status === 'pending' || estimate.status === 'sent') {
    console.log(`Estimate is in ${estimate.status} status, transitioning to approved...`);
    const approvedResult = await updateStatus(estimateId, 'approved');
    if (!approvedResult) {
      console.log('Failed to transition to approved status, aborting');
      return;
    }

    // Wait for the database to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh our estimate data
    const updatedEstimate = await checkEstimateStatus(estimateId);
    if (!updatedEstimate || updatedEstimate.status !== 'approved') {
      console.log('Failed to verify approved status, aborting');
      return;
    }

    // Continue with the updated estimate data
    estimate = updatedEstimate;
  } else if (estimate.status !== 'approved') {
    console.log(`Estimate is in ${estimate.status} status, which is not valid for conversion`);
    return;
  }

  // Step 4: Create the project
  const project = await createProject(estimate);
  if (!project) {
    console.log('Failed to create project, aborting');
    return;
  }

  // Step 5: Link the estimate to the project
  const linkResult = await linkEstimateToProject(estimateId, project.projectid);
  if (!linkResult) {
    console.log('Failed to link estimate to project, the process is incomplete');
    return;
  }

  // Step 6: Verify the final state
  const finalEstimate = await checkEstimateStatus(estimateId);
  if (
    finalEstimate &&
    finalEstimate.projectid === project.projectid &&
    finalEstimate.status === 'converted'
  ) {
    console.log('FIX SUCCESSFUL: Estimate has been converted and linked to the project');
  } else {
    console.log('Verification failed, please check the state manually');
  }
}

// Execute the fix for estimate EST-364978
fixEstimateConversion('EST-364978')
  .then(() => console.log('Process completed'))
  .catch(err => console.error('Unhandled error:', err));

export {};
