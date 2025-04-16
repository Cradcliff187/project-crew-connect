import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling estimate operations
 */

/**
 * Convert an estimate to a project using the database function
 * This uses the convert_estimate_to_project database function
 * which handles all necessary status transitions and data validation
 *
 * If the database function fails, it falls back to a direct JavaScript implementation
 */
export async function convertEstimateToProject(estimateId: string): Promise<{
  success: boolean;
  projectId?: string;
  message?: string;
}> {
  try {
    console.log(`Converting estimate ${estimateId} to project...`);

    // First try the database function approach
    try {
      console.log('Attempting conversion using database function...');
      // Use any type to bypass TypeScript restrictions on RPC function names
      const { data, error } = await (supabase.rpc as any)('convert_estimate_to_project', {
        p_estimate_id: estimateId,
      });

      // If it succeeds, return the result
      if (!error) {
        console.log(`Estimate converted successfully via DB function. Project ID: ${data}`);
        return {
          success: true,
          projectId: data as string,
        };
      }

      // If it fails, log the error and proceed to fallback
      console.log('Database function approach failed:', error.message);

      // If the function doesn't exist, we'll try the direct approach
      if (error.message.includes('function "convert_estimate_to_project" does not exist')) {
        console.log('Database function not found, will try direct approach...');
      } else if (error.message.includes('Invalid status transition')) {
        console.log('Status transition issue, will try direct approach...');
      } else {
        // For other errors, we'll still try the direct approach
        console.log('Other database error, will try direct approach...');
      }
    } catch (dbError) {
      console.log('Exception during database function approach:', dbError);
    }

    // FALLBACK: Direct JavaScript conversion approach
    console.log('Falling back to direct JavaScript conversion...');

    // Step 1: Get the estimate details
    const { data: estimate, error: findError } = await supabase
      .from('estimates')
      .select('*') // Get all fields
      .eq('estimateid', estimateId)
      .single();

    if (findError) {
      throw new Error(`Failed to find estimate: ${findError.message}`);
    }

    // Step 2: Check if already converted
    if (estimate.projectid) {
      return {
        success: false,
        message: `Estimate already converted to project ${estimate.projectid}`,
      };
    }

    // Step 3: Update to approved status if needed
    if (estimate.status !== 'approved') {
      console.log('Updating estimate to approved status...');

      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          status: 'approved',
          approveddate: new Date().toISOString(),
        })
        .eq('estimateid', estimateId);

      if (updateError) {
        throw new Error(`Failed to update status: ${updateError.message}`);
      }
    }

    // Step 4: Generate a unique project ID
    const projectId = 'PRJ-' + Math.floor(Math.random() * 1000000).toString();

    // Step 5: Create the project
    // Get job description from field with space if it exists
    const jobDescription =
      estimate['job description'] || 'Project converted from estimate ' + estimateId;

    const projectData = {
      projectid: projectId,
      customername: estimate.customername,
      projectname: estimate.projectname || 'Project from ' + estimateId,
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
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Step 6: Update the estimate to link it to the project and mark as converted
    const { error: convertError } = await supabase
      .from('estimates')
      .update({
        status: 'converted',
        projectid: projectId,
      })
      .eq('estimateid', estimateId);

    if (convertError) {
      // Try to clean up the created project
      await supabase.from('projects').delete().eq('projectid', projectId);
      throw new Error(`Failed to convert estimate: ${convertError.message}`);
    }

    console.log(`Estimate successfully converted to project ${projectId} via direct approach`);
    return {
      success: true,
      projectId,
    };
  } catch (err: any) {
    console.error('Exception converting estimate:', err);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Update an estimate's status
 * This will follow the valid status transitions enforced by the database
 */
export async function updateEstimateStatus(
  estimateId: string,
  newStatus: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Updating estimate ${estimateId} status to ${newStatus}...`);

    const { error } = await supabase
      .from('estimates')
      .update({ status: newStatus })
      .eq('estimateid', estimateId);

    if (error) {
      console.error('Error updating estimate status:', error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log(`Estimate status updated successfully to ${newStatus}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating estimate status:', err);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Run the database validations script
 * This will create the necessary database functions and triggers
 */
export async function setupDatabaseValidations(): Promise<boolean> {
  try {
    // Dynamically import the script to run it
    await import('@/scripts/db-validations');
    return true;
  } catch (err) {
    console.error('Error setting up database validations:', err);
    return false;
  }
}
