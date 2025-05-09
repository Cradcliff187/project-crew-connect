// Script to apply the calendar fields migration if needed
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCalendarFields() {
  // Read the check SQL
  const sqlPath = path.join(__dirname, 'check_calendar_fields.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    // Execute the check query
    const { data, error } = await supabase.rpc('execute_sql_query', { p_sql: sql });

    if (error) {
      throw error;
    }

    // Group by table
    const tableMap = {};
    if (data && data.length > 0) {
      data.forEach(row => {
        if (!tableMap[row.table_name]) {
          tableMap[row.table_name] = [];
        }
        tableMap[row.table_name].push(row.column_name);
      });
    }

    // Verify all expected tables and columns
    const expectedTables = [
      'project_milestones',
      'maintenance_work_orders',
      'contact_interactions',
      'time_entries',
    ];
    const expectedColumns = ['calendar_sync_enabled', 'calendar_event_id'];

    const missingFields = {};

    expectedTables.forEach(tableName => {
      if (!tableMap[tableName]) {
        missingFields[tableName] = expectedColumns;
      } else {
        const missingColumns = expectedColumns.filter(col => !tableMap[tableName].includes(col));
        if (missingColumns.length > 0) {
          missingFields[tableName] = missingColumns;
        }
      }
    });

    return {
      allFieldsExist: Object.keys(missingFields).length === 0,
      missingFields: missingFields,
    };
  } catch (error) {
    console.error('Error checking calendar fields:', error.message);
    return { allFieldsExist: false, error: error.message };
  }
}

async function applyMigration() {
  // Path to migration file
  const migrationPath = path.join(
    __dirname,
    '..',
    'migrations',
    'add_calendar_fields_to_time_entries.sql'
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying calendar fields migration...\n');

  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('execute_sql_command', { p_sql: migrationSql });

    if (error) {
      throw error;
    }

    console.log('✅ Calendar fields migration applied successfully!');
    return true;
  } catch (error) {
    console.error('Error applying migration:', error.message);
    return false;
  }
}

async function main() {
  console.log('Checking calendar fields status...\n');

  // Check if calendar fields exist
  const checkResult = await checkCalendarFields();

  if (checkResult.allFieldsExist) {
    console.log('✅ All calendar fields are already present in all required tables!');
    return;
  }

  console.log('⚠️ Missing calendar fields detected:');

  Object.keys(checkResult.missingFields).forEach(tableName => {
    const missingColumns = checkResult.missingFields[tableName];
    console.log(`  - Table ${tableName}: missing ${missingColumns.join(', ')}`);
  });

  console.log('\nApplying migration to add missing fields...');

  // Apply the migration
  const migrationResult = await applyMigration();

  if (migrationResult) {
    // Verify the fields again
    const verifyResult = await checkCalendarFields();

    if (verifyResult.allFieldsExist) {
      console.log('\n✅ Verification successful! All calendar fields are now present.');
    } else {
      console.log('\n❌ Some fields are still missing after migration:');

      Object.keys(verifyResult.missingFields).forEach(tableName => {
        const missingColumns = verifyResult.missingFields[tableName];
        console.log(`  - Table ${tableName}: still missing ${missingColumns.join(', ')}`);
      });
    }
  }
}

main();
