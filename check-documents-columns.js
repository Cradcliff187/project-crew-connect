import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDocumentsColumns() {
  try {
    console.log('Checking estimate_documents table columns...');

    // Get a sample doc to see columns
    const { data, error } = await supabase.from('estimate_documents').select('*').limit(1);

    if (error) {
      console.error('Error querying estimate_documents:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('estimate_documents columns:');
      for (const [key, value] of Object.entries(data[0])) {
        console.log(`- ${key}: ${value}`);
      }
    } else {
      console.log('Table exists but is empty.');

      // Try to insert a dummy record to see column validation errors
      console.log('\nTrying dummy insert to check columns...');
      const { error: insertError } = await supabase.from('estimate_documents').insert({
        estimate_id: 'TEST-ID',
        document_id: 'doc-123',
        title: 'Test Document',
        description: 'Test description',
        document_type: 'pdf',
      });

      if (insertError) {
        console.log('Insert error:', insertError.message);

        if (
          insertError.message.includes('column') &&
          insertError.message.includes('does not exist')
        ) {
          const match = insertError.message.match(/column "([^"]+)" of relation/);
          if (match) {
            console.log(`Invalid column: "${match[1]}"`);
          }
        } else if (insertError.message.includes('violates foreign key constraint')) {
          console.log('Foreign key constraint violated, but column names can be inferred');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDocumentsColumns();
