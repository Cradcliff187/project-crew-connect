// Check if execute_sql function exists in Supabase
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctions() {
  try {
    console.log('Checking for execute_sql function...');

    // Check if execute_sql function exists
    const { data, error } = await supabase.from('pg_proc').select('*').eq('proname', 'execute_sql');

    if (error) {
      console.error('Error checking for functions:', error);

      // Try a simpler query
      console.log('Trying direct query to information_schema...');
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (tableError) {
        console.error('Error querying tables:', tableError);
      } else {
        console.log('Tables query result:', tables);
      }

      // Try RPC
      console.log('Testing RPC availability...');
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_service_role');
        if (rpcError) {
          console.error('RPC error:', rpcError);
        } else {
          console.log('RPC result:', rpcResult);
        }
      } catch (e) {
        console.error('RPC exception:', e);
      }

      // Try direct SQL through REST API
      console.log('Testing PostgreSQL connection directly...');
      const { data: restResult, error: restError } = await supabase.auth.admin.queryUsers({
        query: 'SELECT current_database() as db_name',
      });

      if (restError) {
        console.error('REST error:', restError);
      } else {
        console.log('REST result:', restResult);
      }
    } else {
      console.log('Found functions:', data);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

checkFunctions();
