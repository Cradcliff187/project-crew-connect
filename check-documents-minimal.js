import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentsTable() {
  try {
    // Try to get the columns directly
    console.log('Attempting to query a single field to find valid columns...');

    const possibleColumns = [
      'id',
      'estimate_id',
      'doc_id',
      'document_id',
      'filename',
      'file_url',
      'url',
      'type',
      'document_type',
      'title',
      'name',
      'created_at',
      'updated_at',
    ];

    for (const column of possibleColumns) {
      console.log(`Trying to select '${column}'...`);
      const { data, error } = await supabase.from('estimate_documents').select(column).limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Column '${column}' does not exist`);
        } else {
          console.log(`❓ Error with column '${column}': ${error.message}`);
        }
      } else {
        console.log(`✅ Column '${column}' exists`);
      }
    }

    // Try a simple insertion
    console.log('\nTrying a minimal insert with just estimate_id and url...');

    const { data: insertData, error: insertError } = await supabase
      .from('estimate_documents')
      .insert({
        estimate_id: 'TEST-ID',
        url: 'http://example.com/testdoc.pdf',
      })
      .select();

    if (insertError) {
      console.log('Insert error:', insertError.message);
    } else {
      console.log('Insert successful!', insertData);
      console.log('Columns in the table:', Object.keys(insertData[0]).join(', '));

      // Clean up test data
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('estimate_documents')
          .delete()
          .eq('id', insertData[0].id);

        if (deleteError) {
          console.log('Error deleting test data:', deleteError.message);
        } else {
          console.log('Test data deleted successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testDocumentsTable();
