import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function validateSchema() {
  console.log('Validating Supabase Schema...');

  try {
    // 1. Check tables directly
    console.log('\n1. Examining tables directly:');

    // Try to get projects table
    console.log('\nExamining projects table:');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError) {
      console.log('Error fetching projects:', projectsError.message);
    } else if (projects && projects.length > 0) {
      console.log('Projects table exists. Columns:', Object.keys(projects[0]).join(', '));
      console.log('Sample project data:', JSON.stringify(projects[0], null, 2));
    } else {
      console.log('Projects table exists but is empty');
    }

    // Try to get project_budget_items table
    console.log('\nChecking for project_budget_items table:');
    const { data: budgetItems, error: budgetItemsError } = await supabase
      .from('project_budget_items')
      .select('*')
      .limit(1);

    if (budgetItemsError && budgetItemsError.message.includes('does not exist')) {
      console.log('project_budget_items table does NOT exist - will need to be created');
    } else if (budgetItemsError) {
      console.log('Error fetching project_budget_items:', budgetItemsError.message);
    } else {
      console.log('project_budget_items table exists');
      if (budgetItems && budgetItems.length > 0) {
        console.log('Columns:', Object.keys(budgetItems[0]).join(', '));
        console.log('Sample data:', JSON.stringify(budgetItems[0], null, 2));
      } else {
        console.log('Table is empty');
      }
    }

    // Try to get project_documents table
    console.log('\nChecking for project_documents table:');
    const { data: projectDocs, error: projectDocsError } = await supabase
      .from('project_documents')
      .select('*')
      .limit(1);

    if (projectDocsError && projectDocsError.message.includes('does not exist')) {
      console.log('project_documents table does NOT exist - will need to be created');
    } else if (projectDocsError) {
      console.log('Error fetching project_documents:', projectDocsError.message);
    } else {
      console.log('project_documents table exists');
      if (projectDocs && projectDocs.length > 0) {
        console.log('Columns:', Object.keys(projectDocs[0]).join(', '));
        console.log('Sample data:', JSON.stringify(projectDocs[0], null, 2));
      } else {
        console.log('Table is empty');
      }
    }

    // Check for estimate_documents table
    console.log('\nChecking for estimate_documents table:');
    const { data: estimateDocs, error: estimateDocsError } = await supabase
      .from('estimate_documents')
      .select('*')
      .limit(1);

    if (estimateDocsError && estimateDocsError.message.includes('does not exist')) {
      console.log('estimate_documents table does NOT exist');
    } else if (estimateDocsError) {
      console.log('Error fetching estimate_documents:', estimateDocsError.message);
    } else {
      console.log('estimate_documents table exists');
      if (estimateDocs && estimateDocs.length > 0) {
        console.log('Columns:', Object.keys(estimateDocs[0]).join(', '));
        console.log('Sample data:', JSON.stringify(estimateDocs[0], null, 2));
      } else {
        console.log('Table is empty');
      }
    }

    // Check estimate_items
    console.log('\nExamining estimate_items table:');
    const { data: estimateItems, error: estimateItemsError } = await supabase
      .from('estimate_items')
      .select('*')
      .limit(1);

    if (estimateItemsError) {
      console.log('Error fetching estimate_items:', estimateItemsError.message);
    } else if (estimateItems && estimateItems.length > 0) {
      console.log(
        'estimate_items table exists. Columns:',
        Object.keys(estimateItems[0]).join(', ')
      );
      console.log('Sample item data:', JSON.stringify(estimateItems[0], null, 2));
    } else {
      console.log('estimate_items table exists but is empty');
    }

    // Try to check for existing convert_estimate_to_project function
    console.log('\nChecking for convert_estimate_to_project function:');
    try {
      const { data: result, error: funcError } = await supabase.rpc('convert_estimate_to_project', {
        p_estimate_id: 'test-id',
      });

      if (funcError) {
        if (funcError.message.includes('does not exist')) {
          console.log('Function does NOT exist - will need to be created');
        } else {
          console.log('Function exists but returned error:', funcError.message);
        }
      } else {
        console.log('Function exists and works!');
      }
    } catch (funcErr) {
      console.log('Error checking function:', funcErr.message);
    }

    // Check for alternative budget tables
    console.log('\nChecking for alternative budget tables:');
    const potentialTables = [
      'project_costs',
      'project_expenses',
      'project_budgets',
      'budget_items',
      'project_line_items',
    ];

    for (const tableName of potentialTables) {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log(`- ${tableName}: does not exist`);
      } else if (error) {
        console.log(`- ${tableName}: error - ${error.message}`);
      } else {
        console.log(`- ${tableName}: EXISTS - potential match for budget items`);
        if (data && data.length > 0) {
          console.log('  Columns:', Object.keys(data[0]).join(', '));
        }
      }
    }
  } catch (error) {
    console.error('Error validating schema:', error);
  }
}

// Run the validation
validateSchema();
