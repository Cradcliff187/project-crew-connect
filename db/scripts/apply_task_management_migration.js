const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ACCESS_TOKEN;
const MIGRATION_FILE = path.resolve(__dirname, '../migrations/add_task_management_fields.sql');

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN) environment variables must be set.'
  );
  console.error('Set them before running this script:');
  console.error('  export SUPABASE_URL=your_project_url');
  console.error('  export SUPABASE_KEY=your_service_role_key');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function main() {
  try {
    console.log('Starting task management migration...');

    // Read the migration SQL file
    const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
    console.log(`Loaded migration: ${MIGRATION_FILE}`);

    // Execute the SQL - try different RPC function names that might exist
    try {
      // Try pgmigration first
      const { error: pgMigrationError } = await supabase.rpc('pgmigration', { sql: migrationSql });
      if (pgMigrationError) {
        console.log('pgmigration failed, trying exec_sql...');
        // If pgmigration fails, try exec_sql
        const { error: execSqlError } = await supabase.rpc('exec_sql', {
          sql_string: migrationSql,
        });
        if (execSqlError) {
          throw execSqlError;
        }
      }
    } catch (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully!');

    // Verify the changes by querying the column information for project_milestones
    const { data, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'project_milestones')
      .order('ordinal_position');

    if (schemaError) {
      console.error('Error checking schema:', schemaError);
    } else {
      console.log('Current project_milestones table schema:');
      console.log(JSON.stringify(data, null, 2));
    }

    // Verify the project_calendars table was created
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'project_calendars')
      .maybeSingle();

    if (tableError) {
      console.error('Error checking project_calendars table:', tableError);
    } else if (tableData) {
      console.log('project_calendars table created successfully');
    } else {
      console.error('project_calendars table was not created!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
