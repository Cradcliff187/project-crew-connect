/**
 * Utility functions for database migrations
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Creates a Supabase client from environment variables
 * @returns {Object} Supabase client
 */
export function createSupabaseClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ACCESS_TOKEN;

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
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Executes SQL using available RPC functions
 * @param {Object} supabase - Supabase client
 * @param {string} sql - SQL to execute
 * @returns {Promise<Object>} Result object with success and error properties
 */
export async function executeSql(supabase, sql) {
  try {
    // First try pgmigration
    const { error: pgMigrationError } = await supabase.rpc('pgmigration', { sql });

    if (!pgMigrationError) {
      return { success: true };
    }

    console.log('pgmigration failed, trying exec_sql...');

    // If pgmigration fails, try exec_sql
    const { error: execSqlError } = await supabase.rpc('exec_sql', {
      sql_string: sql,
    });

    if (execSqlError) {
      return { success: false, error: execSqlError };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Applies a migration from a file
 * @param {string} migrationPath - Path to migration file
 * @returns {Promise<Object>} Result of the migration
 */
export async function applyMigrationFromFile(migrationPath) {
  try {
    console.log(`Starting migration: ${migrationPath}`);

    // Create client
    const supabase = createSupabaseClient();

    // Read the migration SQL file
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`Loaded migration: ${migrationPath}`);

    // Execute the SQL
    const result = await executeSql(supabase, migrationSql);

    if (!result.success) {
      console.error('Error applying migration:', result.error);
      return { success: false, error: result.error };
    }

    console.log('Migration applied successfully!');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Verifies a table exists in the database
 * @param {Object} supabase - Supabase client
 * @param {string} tableName - Name of the table to verify
 * @returns {Promise<boolean>} Whether the table exists
 */
export async function verifyTableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .maybeSingle();

    if (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(`Error verifying table ${tableName}:`, error);
    return false;
  }
}

// Export all functions
export default {
  createSupabaseClient,
  executeSql,
  applyMigrationFromFile,
  verifyTableExists,
};
