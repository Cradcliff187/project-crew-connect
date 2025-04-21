// Script to apply database migrations in order
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Get migration files
const migrationsDir = path.join(__dirname, '..', 'migrations');
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure migrations run in order

// Function to execute SQL with error handling
async function executeSQL(sql, fileName) {
  console.log(`Executing migration: ${fileName}`);
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error(`Error executing migration ${fileName}:`, error);
      return false;
    }

    console.log(`✅ Migration ${fileName} applied successfully`);
    return true;
  } catch (err) {
    console.error(`Exception executing migration ${fileName}:`, err);
    return false;
  }
}

// Track which migration files we've already applied
async function getAppliedMigrations() {
  try {
    // Check if migration tracking table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'schema_migrations')
      .maybeSingle();

    // Create migration tracking table if it doesn't exist
    if (!tableExists || tableCheckError) {
      console.log('Creating schema_migrations table...');
      await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            migration_name TEXT UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      });
    }

    // Get list of applied migrations
    const { data: migrations, error } = await supabase
      .from('schema_migrations')
      .select('migration_name');

    if (error) {
      console.error('Error fetching applied migrations:', error);
      return [];
    }

    return migrations.map(m => m.migration_name);
  } catch (err) {
    console.error('Exception checking applied migrations:', err);
    return [];
  }
}

// Record that we've applied a migration
async function recordMigration(migrationName) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert([{ migration_name: migrationName }]);

  if (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
  }
}

async function applyMigrations() {
  // First check if exec_sql function exists
  try {
    await supabase.rpc('exec_sql', { sql_string: 'SELECT 1' });
  } catch (err) {
    console.error(
      'exec_sql function not found. Please create this function in the Supabase SQL editor first:'
    );
    console.log(`
      -- Create a function to execute arbitrary SQL (admin only)
      CREATE OR REPLACE FUNCTION exec_sql(sql_string text) RETURNS void AS $$
      BEGIN
        EXECUTE sql_string;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    return;
  }

  const appliedMigrations = await getAppliedMigrations();
  let allSuccessful = true;

  for (const fileName of migrationFiles) {
    // Skip already applied migrations
    if (appliedMigrations.includes(fileName)) {
      console.log(`Skipping already applied migration: ${fileName}`);
      continue;
    }

    const filePath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(filePath, 'utf8');

    const success = await executeSQL(sql, fileName);
    if (success) {
      await recordMigration(fileName);
    } else {
      allSuccessful = false;
      break; // Stop on first failure
    }
  }

  if (allSuccessful) {
    console.log('✨ All migrations applied successfully');
  } else {
    console.error('❌ Migration failed');
    process.exit(1);
  }
}

// Run the migrations
applyMigrations().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
