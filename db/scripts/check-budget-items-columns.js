import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBudgetItemsStructure() {
  try {
    console.log('Checking the structure of the project_budget_items table...');

    // First get a sample entry if one exists
    const { data: budgetItem, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching budget item:', error);
      return;
    }

    if (budgetItem) {
      console.log('Sample budget item columns:');
      for (const [key, value] of Object.entries(budgetItem)) {
        console.log(`- ${key}: ${value}`);
      }
    } else {
      console.log('No budget items found. Getting column information from metadata...');

      // Let's try an alternative approach to get table structure
      const { data, error: defError } = await supabase
        .rpc('get_table_definition', {
          table_name: 'project_budget_items',
        })
        .catch(() => ({ data: null, error: { message: 'Function not available' } }));

      if (defError && defError.message !== 'Function not available') {
        console.error('Error getting table definition:', defError);
      } else if (data) {
        console.log('Table definition:', data);
      } else {
        console.log('Cannot get table definition. Function not available.');
      }

      // Let's try creating a dummy insert to see column validation errors
      console.log('\nAttempting dummy insert to check columns...');
      const { error: insertError } = await supabase.from('project_budget_items').insert({
        project_id: 'TEST-ID',
        description: 'Test item',
        quantity: 1,
        unit_price: 100,
        total_price: 100,
        cost: 80,
        markup_percentage: 25,
        markup_amount: 20,
        item_type: 'material',
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.log('Insert error (expected):', insertError.message);

        // If we get a specific column error, it confirms the column exists but other constraints failed
        if (insertError.message.includes('violates foreign key constraint')) {
          console.log('This confirms some columns exist but foreign key validation failed');
        }

        // Try to extract column information from the error
        const missingColMatch = insertError.message.match(/column "([^"]+)" of relation/);
        if (missingColMatch) {
          console.log(`Column doesn't exist: ${missingColMatch[1]}`);
        }
      }
    }

    // Now check the estimate_items table to see what columns we need to map from
    console.log('\nChecking estimate_items table for comparison:');
    const { data: estItem, error: estError } = await supabase
      .from('estimate_items')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (estError) {
      console.error('Error fetching estimate item:', estError);
      return;
    }

    if (estItem) {
      console.log('Sample estimate item columns:');
      for (const [key, value] of Object.entries(estItem)) {
        console.log(`- ${key}: ${value}`);
      }
    } else {
      console.log('No estimate items found.');
    }
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

checkBudgetItemsStructure();
