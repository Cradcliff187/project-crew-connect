import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectsTable() {
  console.log('Examining Projects Table...');

  try {
    // Get projects table structure
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError) {
      console.log('Error fetching projects:', projectsError.message);
    } else if (projectsData && projectsData.length > 0) {
      console.log('Projects table structure:');

      // Get all column names and their values/types
      const project = projectsData[0];
      const columns = Object.keys(project);

      columns.forEach(col => {
        const value = project[col];
        const type = value === null ? 'null' : typeof value;
        console.log(`- ${col}: ${type} ${value !== null ? `(example: ${value})` : ''}`);
      });

      // Check if we have the fields we need
      const requiredFields = [
        'projectid',
        'customerid',
        'customername',
        'projectname',
        'jobdescription',
        'status',
        'total_budget',
      ];

      const missingFields = requiredFields.filter(field => !columns.includes(field));

      if (missingFields.length > 0) {
        console.log('\nMissing required fields that need to be added:');
        missingFields.forEach(field => console.log(`- ${field}`));
      } else {
        console.log('\nAll required fields exist in projects table');
      }

      // Check for existing budget-related fields
      const budgetFields = columns.filter(
        col =>
          col.includes('budget') ||
          col.includes('cost') ||
          col.includes('amount') ||
          col.includes('expense')
      );

      if (budgetFields.length > 0) {
        console.log('\nExisting budget-related fields:');
        budgetFields.forEach(field => console.log(`- ${field}: ${typeof project[field]}`));
      } else {
        console.log('\nNo budget-related fields found in projects table');
      }
    } else {
      console.log('Projects table exists but is empty');
    }

    // Check if project_budget_items table exists and its structure
    console.log('\nExamining project_budget_items table:');
    const { data: budgetItems, error: budgetItemsError } = await supabase
      .from('project_budget_items')
      .select('*')
      .limit(1);

    if (budgetItemsError && budgetItemsError.message.includes('does not exist')) {
      console.log('project_budget_items table does NOT exist - need to create it');

      // Compare with estimate_items to see what fields we need
      const { data: estimateItems, error: estimateItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .limit(1);

      if (estimateItemsError) {
        console.log('Error fetching estimate_items for comparison:', estimateItemsError.message);
      } else if (estimateItems && estimateItems.length > 0) {
        console.log('Fields needed from estimate_items:');
        const itemFields = Object.keys(estimateItems[0]);

        const fieldsToMap = [
          'description',
          'quantity',
          'unit_price',
          'total_price',
          'cost',
          'markup_percentage',
          'markup_amount',
          'vendor_id',
          'item_type',
          'document_id',
          'notes',
        ];

        fieldsToMap.forEach(field => {
          if (itemFields.includes(field)) {
            console.log(`- ${field} → project_budget_items.${field}`);
          }
        });
      }
    } else if (budgetItemsError) {
      console.log('Error fetching project_budget_items:', budgetItemsError.message);
    } else {
      console.log('project_budget_items table exists');
      if (budgetItems && budgetItems.length > 0) {
        console.log('Existing columns:', Object.keys(budgetItems[0]).join(', '));
      } else {
        console.log('Table is empty, but structure exists');
      }
    }
  } catch (error) {
    console.error('Error examining projects table:', error);
  }
}

// Run the check
checkProjectsTable();
