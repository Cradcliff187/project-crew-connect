import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function examineEstimateToProjectConversion() {
  console.log('Examining Estimate to Project Conversion...');

  try {
    // 1. Check if the convert_estimate_to_project function exists
    console.log('\n1. Checking convert_estimate_to_project function:');
    try {
      const { data: funcResult, error: funcError } = await supabase.rpc(
        'convert_estimate_to_project',
        {
          p_estimate_id: 'test-id',
        }
      );

      console.log('Function exists:', funcError ? 'No' : 'Yes');
      console.log('Error message:', funcError ? funcError.message : 'None');
    } catch (err) {
      console.log('Function check error:', err.message);
    }

    // 2. Examine the estimates table structure
    console.log('\n2. Examining estimates table:');
    const { data: estimateColumns, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .limit(1);

    if (estimateError) {
      console.log('Error retrieving estimates:', estimateError.message);
    } else {
      console.log('Estimate columns:', Object.keys(estimateColumns[0]).join(', '));
      console.log('Sample estimate:', JSON.stringify(estimateColumns[0], null, 2));
    }

    // 3. Examine the projects table structure
    console.log('\n3. Examining projects table:');
    const { data: projectColumns, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectError) {
      console.log('Error retrieving projects:', projectError.message);
    } else {
      console.log('Project columns:', Object.keys(projectColumns[0]).join(', '));
      console.log('Sample project:', JSON.stringify(projectColumns[0], null, 2));
    }

    // 4. Look for estimates that have been converted to projects
    console.log('\n4. Finding converted estimates:');
    const { data: convertedEstimates, error: convertedError } = await supabase
      .from('estimates')
      .select('estimateid, projectid, status')
      .eq('status', 'converted')
      .limit(5);

    if (convertedError) {
      console.log('Error finding converted estimates:', convertedError.message);
    } else {
      console.log('Converted estimates:', JSON.stringify(convertedEstimates, null, 2));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Run the function
examineEstimateToProjectConversion();
