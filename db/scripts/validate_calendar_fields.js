// Script to validate that calendar fields exist in all required tables
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

async function main() {
  // Read the check SQL
  const sqlPath = path.join(__dirname, 'check_calendar_fields.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Validating calendar fields across all relevant tables...\n');

  try {
    // Execute the check query
    const { data, error } = await supabase.rpc('execute_sql_query', { p_sql: sql });

    if (error) {
      throw error;
    }

    // Display the results
    if (data && data.length > 0) {
      console.log('Calendar fields found:');
      console.log('-------------------');

      // Group by table
      const tableMap = {};
      data.forEach(row => {
        if (!tableMap[row.table_name]) {
          tableMap[row.table_name] = [];
        }
        tableMap[row.table_name].push(row);
      });

      // Display results by table
      Object.keys(tableMap)
        .sort()
        .forEach(tableName => {
          console.log(`\nTable: ${tableName}`);
          console.log('-'.repeat(tableName.length + 7));

          tableMap[tableName].forEach(row => {
            console.log(
              `  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`
            );
          });
        });

      // Verify all expected tables and columns
      const expectedTables = [
        'project_milestones',
        'maintenance_work_orders',
        'contact_interactions',
        'time_entries',
      ];
      const expectedColumns = ['calendar_sync_enabled', 'calendar_event_id'];

      let allFound = true;

      expectedTables.forEach(tableName => {
        if (!tableMap[tableName]) {
          console.log(`\n❌ Missing calendar fields in table: ${tableName}`);
          allFound = false;
        } else {
          const columns = tableMap[tableName].map(row => row.column_name);

          expectedColumns.forEach(columnName => {
            if (!columns.includes(columnName)) {
              console.log(`\n❌ Missing column ${columnName} in table ${tableName}`);
              allFound = false;
            }
          });
        }
      });

      if (allFound) {
        console.log('\n✅ All calendar fields are present in all required tables!');
      } else {
        console.log('\n⚠️ Some calendar fields are missing. Please apply the migration.');
      }
    } else {
      console.log('❌ No calendar fields found in any tables!');
      console.log('Run the calendar fields migration first.');
    }
  } catch (error) {
    console.error('Error validating calendar fields:', error.message);
    process.exit(1);
  }
}

main();
