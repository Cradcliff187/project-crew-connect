import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDocumentsTable() {
  try {
    console.log('Checking if estimate_documents table exists...');

    // Try to query the table
    const { data, error } = await supabase.from('estimate_documents').select('*').limit(1);

    if (error) {
      console.log('Error querying estimate_documents:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('The estimate_documents table does not exist.');
      }
    } else {
      console.log('estimate_documents table exists!');
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      } else {
        console.log('Table exists but is empty.');
      }
    }

    // Check what tables actually exist
    console.log('\nListing all available tables:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.log('Error listing tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name).join(', ');
      console.log('Available tables:', tableNames);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDocumentsTable();
