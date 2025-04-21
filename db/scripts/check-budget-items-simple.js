import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  try {
    // 1. Try inserting a test budget item to see what columns exist
    console.log('Testing project_budget_items structure with a test insert...');

    const testItem = {
      project_id: 'TEST-PROJ-ID',
      description: 'Test item',
      qty: 1, // Try 'qty' instead of 'quantity'
      unit_price: 100,
      price: 100, // Try 'price' instead of 'total_price'
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('project_budget_items').insert(testItem);

    if (insertError) {
      console.log('Insert error details:', insertError);

      if (
        insertError.message.includes('column') &&
        insertError.message.includes('does not exist')
      ) {
        const match = insertError.message.match(/column "([^"]+)" of relation/);
        if (match) {
          console.log(`Invalid column: "${match[1]}"`);
        }
      }
    }

    // 2. Check estimate_items structure
    console.log('\nChecking estimate_items structure...');
    const { data: estimateItems, error: estError } = await supabase
      .from('estimate_items')
      .select('*')
      .limit(1);

    if (estError) {
      console.error('Error fetching estimate items:', estError);
    } else if (estimateItems && estimateItems.length > 0) {
      console.log('Estimate item columns:', Object.keys(estimateItems[0]).join(', '));
    } else {
      console.log('No estimate items found');
    }

    // 3. Get project structure
    console.log('\nChecking projects table structure...');
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projError) {
      console.error('Error fetching projects:', projError);
    } else if (projects && projects.length > 0) {
      console.log('Project columns:', Object.keys(projects[0]).join(', '));
    } else {
      console.log('No projects found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructures();
