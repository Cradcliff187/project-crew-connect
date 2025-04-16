import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace with your actual Supabase URL and key if different
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Find recently converted or attempted conversions
 */
async function findRecentConversions() {
  console.log('Looking for recently converted estimates...');

  try {
    // First check recent estimates with non-null projectid (successfully converted)
    const { data: convertedEstimates, error: convertedError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid, customername, projectname, estimateamount')
      .not('projectid', 'is', null)
      .limit(5);

    if (convertedError) {
      console.error(`Error finding converted estimates: ${convertedError.message}`);
    } else if (convertedEstimates && convertedEstimates.length > 0) {
      console.log('\nEstimates with project links:');
      convertedEstimates.forEach((est, i) => {
        console.log(
          `${i + 1}. ID: ${est.estimateid} | Status: ${est.status} | Project: ${est.projectid || 'None'} | Name: ${est.projectname || est.customername} | Amount: ${est.estimateamount || 0}`
        );
      });

      return convertedEstimates[0].estimateid;
    } else {
      console.log('No estimates with project links found.');
    }

    // Find any estimates with converted status
    const { data: convertedStatusEstimates, error: statusError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid, customername, projectname, estimateamount')
      .eq('status', 'converted')
      .limit(5);

    if (statusError) {
      console.error(`Error finding converted status estimates: ${statusError.message}`);
    } else if (convertedStatusEstimates && convertedStatusEstimates.length > 0) {
      console.log('\nEstimates with converted status:');
      convertedStatusEstimates.forEach((est, i) => {
        console.log(
          `${i + 1}. ID: ${est.estimateid} | Status: ${est.status} | Project: ${est.projectid || 'None'} | Name: ${est.projectname || est.customername} | Amount: ${est.estimateamount || 0}`
        );
      });

      return convertedStatusEstimates[0].estimateid;
    } else {
      console.log('No estimates with converted status found.');
    }

    // Just find any estimates
    const { data: recentEstimates, error: recentError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid, customername, projectname, estimateamount')
      .limit(5);

    if (recentError) {
      console.error(`Error finding recent estimates: ${recentError.message}`);
      return null;
    }

    if (recentEstimates && recentEstimates.length > 0) {
      console.log('\nRecent estimates:');
      recentEstimates.forEach((est, i) => {
        console.log(
          `${i + 1}. ID: ${est.estimateid} | Status: ${est.status} | Project: ${est.projectid || 'None'} | Name: ${est.projectname || est.customername} | Amount: ${est.estimateamount || 0}`
        );
      });

      return recentEstimates[0].estimateid;
    }

    console.log('No estimates found at all.');
    return null;
  } catch (error) {
    console.error('Error searching for recent conversions:', error);
    return null;
  }
}

/**
 * Check if an estimate was successfully converted to a project
 * @param {string} estimateId - The ID of the estimate to check
 */
async function validateEstimateConversion(estimateId) {
  console.log(`\nValidating conversion for estimate ${estimateId}...`);

  try {
    // 1. Check the estimate's status and linked project
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid, customername, projectname, estimateamount')
      .eq('estimateid', estimateId)
      .single();

    if (estimateError) {
      console.error(`Error fetching estimate: ${estimateError.message}`);
      return false;
    }

    console.log(`Estimate status: ${estimate.status}`);
    console.log(`Linked project ID: ${estimate.projectid || 'None'}`);
    console.log(`Name: ${estimate.projectname || estimate.customername}`);
    console.log(`Amount: ${estimate.estimateamount || 0}`);

    // 2. If there's a linked project, check if it exists
    if (estimate.projectid) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', estimate.projectid)
        .single();

      if (projectError) {
        console.error(`Error fetching linked project: ${projectError.message}`);
        return false;
      }

      console.log('\nProject details:');
      console.log(`- Project ID: ${project.projectid}`);
      console.log(`- Project Name: ${project.projectname}`);
      console.log(`- Customer Name: ${project.customername}`);
      console.log(`- Status: ${project.status}`);
      console.log(`- Total Budget: ${project.total_budget}`);

      // 3. Validation result
      const isFullyConverted = estimate.status === 'converted' && estimate.projectid && project;

      console.log('\n=== VALIDATION RESULT ===');
      if (isFullyConverted) {
        console.log(
          '✅ CONVERSION SUCCESSFUL: Estimate is properly converted and linked to a project'
        );
      } else if (estimate.projectid && project) {
        console.log(
          '⚠️ PARTIAL CONVERSION: Project exists and is linked, but estimate status is not "converted"'
        );
      } else if (estimate.status === 'converted' && !estimate.projectid) {
        console.log(
          '⚠️ INCONSISTENT STATE: Estimate is marked as converted but has no linked project'
        );
      } else {
        console.log('❌ NOT CONVERTED: Estimate has not been converted to a project');
      }

      return isFullyConverted;
    } else {
      console.log('\n=== VALIDATION RESULT ===');
      console.log('❌ NOT CONVERTED: Estimate has no linked project');
      return false;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Get the estimate ID from command line arguments or find recently converted ones
    let estimateId = process.argv[2];

    if (!estimateId) {
      console.log('No estimate ID provided, looking for recent conversions...');
      estimateId = await findRecentConversions();

      if (!estimateId) {
        console.log('No estimates found to check. Please provide an estimate ID.');
        process.exit(1);
      }

      console.log(`\nSelected estimate ID: ${estimateId} for validation`);
    }

    // Run the validation
    await validateEstimateConversion(estimateId);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main();
