import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    // First get a sample record to see all fields
    console.log('Getting a sample record to see available columns...');
    const { data: sample, error: sampleError } = await supabase
      .from('estimates')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error getting sample:', sampleError.message);
      return;
    }

    if (!sample || sample.length === 0) {
      console.log('No records found');
      return;
    }

    console.log('Available columns in estimates table:');
    Object.keys(sample[0]).forEach(column => {
      console.log(`- ${column}`);
    });

    // Also check projects table
    console.log('\nGetting projects table columns...');
    const { data: projectSample, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectError) {
      console.error('Error getting project sample:', projectError.message);
    } else if (projectSample && projectSample.length > 0) {
      console.log('Available columns in projects table:');
      Object.keys(projectSample[0]).forEach(column => {
        console.log(`- ${column}`);
      });
    } else {
      console.log('No project records found');
    }

    // Test a minimal conversion approach
    console.log('\nTesting minimal project creation...');
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert([
        {
          projectname: 'Test Project ' + Date.now(),
          status: 'active',
          createdon: new Date().toISOString(),
        },
      ])
      .select();

    if (createError) {
      console.error('Error creating project:', createError.message);
    } else {
      console.log('Successfully created project:', newProject[0].projectid);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkColumns();
