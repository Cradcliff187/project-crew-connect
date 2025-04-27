// Script to create the exec_sql function
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

// SQL to create the exec_sql function
const createFunctionSQL = `
-- Create a function to execute arbitrary SQL (admin only)
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function...');

    // Create the function directly with SQL query
    const { data, error } = await supabase
      .from('_queries')
      .select('*')
      .csv()
      .execute(createFunctionSQL);

    // Alternative approach if the above doesn't work
    if (error) {
      console.error('Error creating exec_sql function:', error);

      // Try with Postgres function
      console.log('Trying alternative approach...');
      try {
        const resp = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabase.supabaseKey,
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            query: createFunctionSQL,
          }),
        });

        if (!resp.ok) {
          console.error('Error with alternative approach:', await resp.text());
        }
      } catch (err) {
        console.error('Alternative approach failed:', err);
        console.log('Please run the following SQL directly in the Supabase dashboard:');
        console.log(createFunctionSQL);
      }
    } else {
      console.log('exec_sql function created successfully!');
    }

    // Test if the function exists
    console.log('Testing exec_sql function...');
    try {
      const { error: testError } = await supabase.rpc('exec_sql', {
        sql_string: 'SELECT 1;',
      });

      if (testError) {
        console.error('Error testing exec_sql function:', testError);
        console.log('Please create the function manually in the Supabase dashboard.');
      } else {
        console.log('exec_sql function is working properly!');
      }
    } catch (err) {
      console.error('Error testing function:', err);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function creation
createExecSqlFunction();
