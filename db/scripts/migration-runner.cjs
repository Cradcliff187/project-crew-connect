/**
 * Universal Migration Runner
 *
 * This script runs any migration file using the MCP connection and our standardized approach.
 * Use: node db/scripts/migration-runner.cjs path/to/migration.sql
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

/**
 * Executes SQL using available RPC functions
 * @param {string} sql - SQL to execute
 * @param {string} description - Description of the SQL for logging
 * @returns {Promise<boolean>} Success status
 */
async function executeSql(sql, description = 'SQL statement') {
  console.log(`\nExecuting SQL for ${description}...`);

  try {
    // First try execute_sql_command
    const { error: cmdError } = await supabase.rpc('execute_sql_command', {
      p_sql: sql,
    });

    if (!cmdError) {
      console.log(`✅ ${description} - SQL executed successfully via execute_sql_command`);
      return true;
    }

    console.log(`execute_sql_command failed, trying execute_sql_query...`);

    // Then try execute_sql_query
    const { error: queryError } = await supabase.rpc('execute_sql_query', {
      p_sql: sql,
    });

    if (!queryError) {
      console.log(`✅ ${description} - SQL executed successfully via execute_sql_query`);
      return true;
    }

    console.log(`❌ ${description} - Failed to execute SQL: ${queryError.message}`);
    return false;
  } catch (error) {
    console.error(`Error executing ${description} SQL:`, error);
    return false;
  }
}

/**
 * Verifies if a table exists
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} Whether the table exists
 */
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase.rpc('execute_sql_query', {
      p_sql: `
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = '${tableName}'
        ) as "exists"
      `,
    });

    if (error) {
      console.error(`Error checking table ${tableName}:`, error.message);
      return false;
    }

    return data && data.length > 0 && data[0]?.exists === true;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

/**
 * Verifies if columns exist in a table
 * @param {string} tableName - Name of the table
 * @param {Array<string>} columnNames - Column names to check
 * @returns {Promise<Object>} Object with column existence status
 */
async function columnsExist(tableName, columnNames) {
  try {
    const result = {};

    // Use a single query to check all columns
    const columnsStr = columnNames.map(col => `'${col}'`).join(',');
    const { data, error } = await supabase.rpc('execute_sql_query', {
      p_sql: `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND column_name IN (${columnsStr})
      `,
    });

    if (error) {
      console.error(`Error checking columns in ${tableName}:`, error.message);
      columnNames.forEach(col => (result[col] = false));
      return result;
    }

    // Mark columns as existing or not
    const existingColumns = data ? data.map(row => row.column_name) : [];
    columnNames.forEach(col => {
      result[col] = existingColumns.includes(col);
    });

    return result;
  } catch (error) {
    console.error(`Error checking columns in ${tableName}:`, error);
    return columnNames.reduce((acc, col) => ({ ...acc, [col]: false }), {});
  }
}

/**
 * Main function to run a migration file
 * @param {string} migrationPath - Path to the migration file
 */
async function runMigration(migrationPath) {
  if (!migrationPath) {
    console.error('❌ No migration file specified!');
    console.log('Usage: node db/scripts/migration-runner.cjs path/to/migration.sql');
    process.exit(1);
  }

  // Resolve the migration path
  const fullPath = path.resolve(process.cwd(), migrationPath);

  try {
    console.log(`📄 Migration file: ${fullPath}`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Migration file does not exist: ${fullPath}`);
      process.exit(1);
    }

    // Read migration file
    const migrationSql = fs.readFileSync(fullPath, 'utf8');
    console.log(`✅ Migration file loaded (${migrationSql.length} bytes)`);

    // Execute the SQL
    const success = await executeSql(migrationSql, 'migration');

    if (success) {
      console.log('✅ Migration completed successfully!');

      // Extract table names that might have been created
      const tableMatches = migrationSql.match(
        /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi
      );
      const tableNames = tableMatches
        ? tableMatches
            .map(match => {
              const nameMatch = match.match(
                /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i
              );
              return nameMatch ? nameMatch[1] : null;
            })
            .filter(Boolean)
        : [];

      // If tables were created, verify they exist
      if (tableNames.length > 0) {
        console.log('\nVerifying created tables:');

        for (const tableName of tableNames) {
          const exists = await tableExists(tableName);
          console.log(`- ${tableName}: ${exists ? 'EXISTS ✅' : 'MISSING ❌'}`);
        }
      }

      // Extract column additions
      const alterTableMatches = migrationSql.match(/ALTER\s+TABLE\s+(?:public\.)?(\w+)/gi);
      const alteredTables = alterTableMatches
        ? alterTableMatches
            .map(match => {
              const tableMatch = match.match(/ALTER\s+TABLE\s+(?:public\.)?(\w+)/i);
              return tableMatch ? tableMatch[1] : null;
            })
            .filter(Boolean)
        : [];

      // If tables were altered, check their columns
      if (alteredTables.length > 0) {
        console.log('\nChecking altered tables:');

        for (const tableName of alteredTables) {
          // Extract column names that were added
          const addColumnMatches = migrationSql.match(
            new RegExp(
              `ALTER\\s+TABLE\\s+(?:public\\.)?${tableName}[\\s\\S]*?ADD\\s+COLUMN\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(\\w+)`,
              'gi'
            )
          );

          if (addColumnMatches) {
            const columnNames = addColumnMatches
              .map(match => {
                const columnMatch = match.match(/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
                return columnMatch ? columnMatch[1] : null;
              })
              .filter(Boolean);

            if (columnNames.length > 0) {
              console.log(`\nColumns added to ${tableName}:`);
              const columnStatus = await columnsExist(tableName, columnNames);

              for (const [column, exists] of Object.entries(columnStatus)) {
                console.log(`- ${column}: ${exists ? 'EXISTS ✅' : 'MISSING ❌'}`);
              }
            }
          }
        }
      }
    } else {
      console.error('❌ Migration failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

// Get the migration file path from command line arguments
const migrationPath = process.argv[2];

// Run the migration
runMigration(migrationPath);
