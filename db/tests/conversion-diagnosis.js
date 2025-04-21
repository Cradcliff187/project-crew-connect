import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Find the converted estimate(s) and get complete details
 */
async function getDetailedConversionInfo() {
  try {
    // Get converted estimates
    console.log('1. Fetching converted estimates...');
    const { data: convertedEstimates, error: convertedError } = await supabase
      .from('estimates')
      .select('*')
      .eq('status', 'converted')
      .limit(10);

    if (convertedError) {
      console.error(`Error fetching converted estimates: ${convertedError.message}`);
      return null;
    }

    if (!convertedEstimates || convertedEstimates.length === 0) {
      console.log('No converted estimates found.');
      return null;
    }

    // Display converted estimates with complete data
    console.log(`Found ${convertedEstimates.length} converted estimates:`);
    convertedEstimates.forEach((est, i) => {
      const keys = Object.keys(est).filter(k => k !== 'items' && est[k] !== null);
      console.log(`\n[ESTIMATE ${i + 1}] ID: ${est.estimateid}`);

      // Display all non-null fields for complete information
      keys.forEach(key => {
        console.log(`  ${key}: ${est[key]}`);
      });
    });

    // Select the most recent one
    const estimate = convertedEstimates[0];

    // 2. Get the linked project details
    if (estimate.projectid) {
      console.log('\n2. Fetching linked project details...');
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', estimate.projectid)
        .single();

      if (projectError) {
        console.error(`Error fetching project: ${projectError.message}`);
      } else if (project) {
        console.log('\n[PROJECT DETAILS]');

        // Display all non-null fields for complete information
        Object.keys(project)
          .filter(k => project[k] !== null)
          .forEach(key => {
            console.log(`  ${key}: ${project[key]}`);
          });
      }
    }

    // 3. Check for conversion history in logs if available
    console.log('\n3. Checking for logs related to conversion...');
    const { data: logs, error: logsError } = await supabase
      .from('logs')
      .select('*')
      .ilike('message', `%${estimate.estimateid}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (logsError) {
      console.log(`No logs table found or error: ${logsError.message}`);
    } else if (logs && logs.length > 0) {
      console.log(`Found ${logs.length} log entries for this estimate ID:`);
      logs.forEach((log, i) => {
        console.log(`\n[LOG ${i + 1}] ${log.created_at}`);
        console.log(`  ${log.message}`);
        if (log.details) console.log(`  Details: ${log.details}`);
      });
    } else {
      console.log('No logs found for this estimate.');
    }

    // 4. Check status history if available
    console.log('\n4. Checking for status history...');
    const { data: history, error: historyError } = await supabase
      .from('estimate_status_history')
      .select('*')
      .eq('estimateid', estimate.estimateid)
      .order('changed_at', { ascending: true });

    if (historyError) {
      console.log(`No status history table found or error: ${historyError.message}`);
    } else if (history && history.length > 0) {
      console.log(`Found ${history.length} status change records:`);
      history.forEach((entry, i) => {
        console.log(
          `  ${i + 1}. ${entry.changed_at || 'unknown'}: ${entry.from_status || 'unknown'} → ${entry.to_status}`
        );
      });
    } else {
      console.log('No status history found for this estimate.');
    }

    // 5. Attempt to get database function execution logs if they exist
    console.log('\n5. Checking database function logs...');
    const { data: functionLogs, error: functionError } = await supabase
      .from('db_function_logs')
      .select('*')
      .ilike('function_name', '%convert%')
      .order('executed_at', { ascending: false })
      .limit(10);

    if (functionError) {
      console.log(`No function logs table found or error: ${functionError.message}`);
    } else if (functionLogs && functionLogs.length > 0) {
      console.log(`Found ${functionLogs.length} function execution logs:`);
      functionLogs.forEach((log, i) => {
        console.log(`\n[FUNCTION LOG ${i + 1}] ${log.executed_at}`);
        console.log(`  Function: ${log.function_name}`);
        console.log(`  Status: ${log.success ? 'Success' : 'Failure'}`);
        if (log.parameters) console.log(`  Parameters: ${JSON.stringify(log.parameters)}`);
        if (log.result) console.log(`  Result: ${log.result}`);
        if (log.error) console.log(`  Error: ${log.error}`);
      });
    } else {
      console.log('No function execution logs found.');
    }

    // 6. Try to determine what happened
    console.log('\n=== CONVERSION DIAGNOSIS ===');
    if (estimate.status === 'converted' && estimate.projectid) {
      console.log('✅ RESULT: Estimate was successfully converted to a project.');

      // Try to determine the conversion path
      if (estimate.approveddate && estimate.sentdate) {
        if (new Date(estimate.approveddate) > new Date(estimate.sentdate)) {
          console.log('📊 PATH: The estimate was likely converted following the normal workflow:');
          console.log('   draft → sent → approved → converted');
        } else {
          console.log('📊 PATH: The estimate appears to have followed an unusual status sequence.');
        }
      } else if (estimate.approveddate && !estimate.sentdate) {
        console.log('📊 PATH: The estimate appears to have skipped the "sent" status:');
        console.log('   draft → approved → converted');
      } else {
        console.log('📊 PATH: Unable to determine the exact conversion path from the timestamps.');
      }

      // Record what probably happened based on our analysis
      console.log('\n📋 Most likely scenario:');
      if (logs && logs.length > 0 && logs.some(log => log.message.includes('direct JavaScript'))) {
        console.log('   The conversion was handled through the JavaScript fallback method.');
        console.log(
          '   This occurred because the database function approach encountered an error.'
        );
        console.log('   The status transition validation was bypassed.');
      } else if (
        logs &&
        logs.length > 0 &&
        logs.some(log => log.message.includes('Simple Convert'))
      ) {
        console.log('   The conversion was done using the "Simple Convert" button.');
        console.log('   This method directly creates a project and links it to the estimate.');
      } else {
        console.log('   The conversion was successful, but the exact method cannot be determined.');
      }
    } else {
      console.log('❌ RESULT: Conversion is incomplete or in an unusual state.');
    }

    return estimate;
  } catch (error) {
    console.error('Error in getDetailedConversionInfo:', error);
    return null;
  }
}

// Main execution
getDetailedConversionInfo()
  .then(() => {
    console.log('\nDiagnosis complete.');
  })
  .catch(error => {
    console.error('Error executing diagnosis:', error);
  });
