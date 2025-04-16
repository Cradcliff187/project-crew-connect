// Schema validator script
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the proxy.js file
const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  },
});

async function getTableSchema(tableName) {
  // Get table columns from information_schema
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error) {
    console.error(`Error fetching schema for table ${tableName}:`, error);
    return null;
  }

  return data;
}

async function validateSchema() {
  try {
    console.log('Validating Supabase schema against front-end types...');

    // We'll focus on the employees table first as requested
    const employeesSchema = await getTableSchema('employees');

    console.log('\n== EMPLOYEES TABLE SCHEMA FROM SUPABASE ==');
    console.table(employeesSchema);

    // Get sample data to understand the actual structure
    const { data: employeeSamples, error: sampleError } = await supabase
      .from('employees')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('Error fetching employee samples:', sampleError);
    } else {
      console.log('\n== EMPLOYEE SAMPLE DATA ==');
      console.table(employeeSamples);
    }

    console.log('\n== FRONT-END EMPLOYEE INTERFACES ==');
    console.log('In common.ts: employee_id, first_name, last_name');
    console.log('In timeTracking.ts: employee_id, name, hourly_rate?');

    // Check for foreign key relationships
    const { data: relationships, error: relError } = await supabase
      .from('information_schema.constraint_column_usage')
      .select(
        `
        constraint_name,
        table_name,
        column_name,
        table_schema
      `
      )
      .eq('table_schema', 'public')
      .filter('table_name', 'eq', 'employees')
      .or('constraint_name.ilike.%employees%');

    if (relError) {
      console.error('Error fetching relationships:', relError);
    } else {
      console.log('\n== EMPLOYEE TABLE RELATIONSHIPS ==');
      console.table(relationships);
    }
  } catch (error) {
    console.error('Validation error:', error);
  }
}

validateSchema().catch(console.error);
