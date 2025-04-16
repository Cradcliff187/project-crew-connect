import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  console.log('=== EXAMINING TABLE STRUCTURES ===\n');

  // First, let's check if our project_documents table exists
  console.log('Checking project_documents table...');
  try {
    const { data: projectDocs, error: projectDocsError } = await supabase
      .from('project_documents')
      .select('*')
      .limit(1);

    if (projectDocsError && projectDocsError.message.includes('does not exist')) {
      console.log('project_documents table does not exist yet');
    } else if (projectDocsError) {
      console.log('Error querying project_documents:', projectDocsError.message);
    } else {
      console.log('project_documents table exists');

      // If we have data, show the columns
      if (projectDocs && projectDocs.length > 0) {
        console.log('Column structure:', Object.keys(projectDocs[0]).join(', '));
      } else {
        console.log('Table exists but has no rows');
      }
    }
  } catch (err) {
    console.error('Error examining project_documents:', err);
  }

  // Now check estimate_documents
  console.log('\nChecking estimate_documents table...');
  try {
    const { data: estimateDocs, error: estimateDocsError } = await supabase
      .from('estimate_documents')
      .select('*')
      .limit(1);

    if (estimateDocsError && estimateDocsError.message.includes('does not exist')) {
      console.log('estimate_documents table does not exist - this is unexpected!');
    } else if (estimateDocsError) {
      console.log('Error querying estimate_documents:', estimateDocsError.message);
    } else {
      console.log('estimate_documents table exists');

      // If there are rows, print column structure
      if (estimateDocs && estimateDocs.length > 0) {
        console.log('Column structure:', Object.keys(estimateDocs[0]).join(', '));
        console.log('Sample data:', estimateDocs[0]);
      } else {
        // If no data, try to infer structure by attempting an insert
        console.log('Table exists but has no rows');

        // Test a bunch of possible columns
        const testColumns = [
          'id',
          'estimate_id',
          'file_name',
          'document_id',
          'file_id',
          'url',
          'title',
          'type',
          'document_type',
        ];

        for (const col of testColumns) {
          try {
            const { data: colCheck, error: colError } = await supabase
              .from('estimate_documents')
              .select(col)
              .limit(1);

            if (colError && colError.message.includes('does not exist')) {
              console.log(`× Column '${col}' does not exist`);
            } else {
              console.log(`✓ Column '${col}' exists`);
            }
          } catch (err) {
            console.log(`? Error checking column '${col}':`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error examining estimate_documents:', err);
  }

  // Also check project_budget_items
  console.log('\nChecking project_budget_items structure...');
  try {
    const { data: budgetItems, error: budgetError } = await supabase
      .from('project_budget_items')
      .select('*')
      .limit(1);

    if (budgetError && budgetError.message.includes('does not exist')) {
      console.log('project_budget_items table does not exist');
    } else if (budgetError) {
      console.log('Error querying project_budget_items:', budgetError.message);
    } else {
      console.log('project_budget_items table exists');

      if (budgetItems && budgetItems.length > 0) {
        console.log('Column structure:', Object.keys(budgetItems[0]).join(', '));
      } else {
        console.log('Table exists but has no rows');
      }
    }
  } catch (err) {
    console.error('Error examining project_budget_items:', err);
  }
}

// Run the check
checkStructure();
