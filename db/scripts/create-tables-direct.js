import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDbSetup() {
  try {
    console.log('Checking database setup...');

    // 1. Check if project_documents table exists
    console.log('\n1. Checking if project_documents table exists...');
    try {
      const { data: documents, error: docError } = await supabase
        .from('project_documents')
        .select('*')
        .limit(1);

      if (docError && docError.code === '42P01') {
        console.log('project_documents table does not exist');

        try {
          // Try to run RPC function to create the table, if available
          const { data, error } = await supabase.rpc('setup_project_documents');
          if (error) {
            console.log('Cannot create table via RPC:', error.message);
          } else {
            console.log('Table created via RPC function');
          }
        } catch (err) {
          console.log('No RPC function available for table creation:', err.message);
        }
      } else if (docError) {
        console.log('Error checking project_documents table:', docError.message);
      } else {
        console.log('project_documents table exists!');
      }
    } catch (err) {
      console.log('Error checking project_documents table:', err.message);
    }

    // 2. Check if convert_estimate_to_project function exists
    console.log('\n2. Checking if convert_estimate_to_project function exists...');
    try {
      const { data, error } = await supabase.rpc('convert_estimate_to_project', {
        p_estimate_id: 'NONEXISTENT-ID',
      });

      if (error && error.message.includes('Estimate not found')) {
        console.log('convert_estimate_to_project function exists!');
      } else if (error && error.message.includes('does not exist')) {
        console.log('convert_estimate_to_project function does not exist');

        try {
          // Try to run RPC function to create the function, if available
          const { data, error } = await supabase.rpc('setup_convert_estimate_to_project');
          if (error) {
            console.log('Cannot create function via RPC:', error.message);
          } else {
            console.log('Function created via RPC function');
          }
        } catch (err) {
          console.log('No RPC function available for function creation:', err.message);
        }
      } else if (error) {
        console.log('Error checking function:', error.message);
      } else {
        console.log('Unexpected successful response from non-existent ID');
      }
    } catch (err) {
      console.log('Error checking convert_estimate_to_project function:', err.message);
    }

    // 3. Test project table structure
    console.log('\n3. Examining projects table structure...');
    try {
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (projError) {
        console.log('Error accessing projects table:', projError.message);
      } else {
        console.log('Projects table accessible');
        if (projects && projects.length > 0) {
          const columns = Object.keys(projects[0]);
          console.log('Project columns:', columns.join(', '));
        } else {
          console.log('No projects found in database');
        }
      }
    } catch (err) {
      console.log('Error examining projects table:', err.message);
    }

    // 4. Test project_budget_items table
    console.log('\n4. Examining project_budget_items table...');
    try {
      const { data: budgetItems, error: budgetError } = await supabase
        .from('project_budget_items')
        .select('*')
        .limit(1);

      if (budgetError && budgetError.code === '42P01') {
        console.log('project_budget_items table does not exist');
      } else if (budgetError) {
        console.log('Error checking project_budget_items table:', budgetError.message);
      } else {
        console.log('project_budget_items table exists!');
        if (budgetItems && budgetItems.length > 0) {
          const columns = Object.keys(budgetItems[0]);
          console.log('Budget item columns:', columns.join(', '));
        } else {
          console.log('No budget items found');
        }
      }
    } catch (err) {
      console.log('Error examining project_budget_items table:', err.message);
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the verification
verifyDbSetup();
