const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ACCESS_TOKEN;
const MIGRATION_FILE = path.resolve(__dirname, '../migrations/002_add_source_item_id.sql');

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ACCESS_TOKEN) environment variables must be set.'
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
    console.log('Starting migration...');

    // Read the migration SQL file
    const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
    console.log(`Loaded migration: ${MIGRATION_FILE}`);

    // Execute the SQL
    const { error } = await supabase.rpc('pgmigration', { sql: migrationSql });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully!');

    // Verify the changes by querying the table information
    const { data, error: schemaError } = await supabase.rpc('pginfo', {
      table_name: 'estimate_items',
    });

    if (schemaError) {
      console.error('Error checking schema:', schemaError);
    } else {
      console.log('Current estimate_items table schema:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
