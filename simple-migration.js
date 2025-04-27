// Simple script to apply SQL statements to Supabase
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

// SQL statements to execute
const sqlStatements = [
  'ALTER TABLE IF EXISTS estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;',
  "COMMENT ON COLUMN IF EXISTS estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';",
  'CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);',
];

/**
 * Execute a SQL statement using the Supabase REST API
 */
async function executeSql(sql) {
  try {
    console.log(`Executing SQL: ${sql.slice(0, 80)}...`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        sql_string: sql,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`Error executing SQL (${response.status}): ${text}`);
      return false;
    }

    console.log(`Successfully executed SQL statement.`);
    return true;
  } catch (error) {
    console.error(`Exception executing SQL: ${error.message}`);
    return false;
  }
}

/**
 * Try to create the exec_sql function if it doesn't exist
 */
async function createExecSqlFunction() {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_string;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'params=single-object',
      },
      body: JSON.stringify({
        query: createFunctionSql,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`Error creating exec_sql function (${response.status}): ${text}`);
      return false;
    }

    console.log('Successfully created exec_sql function.');
    return true;
  } catch (error) {
    console.error(`Exception creating exec_sql function: ${error.message}`);
    return false;
  }
}

/**
 * Execute all SQL statements in sequence
 */
async function runMigration() {
  console.log('======================================');
  console.log('Starting migration to add source_item_id column');
  console.log('======================================');

  // First try to create the exec_sql function if needed
  await createExecSqlFunction();

  // Now execute all statements
  let success = true;

  for (const sql of sqlStatements) {
    const result = await executeSql(sql);
    if (!result) {
      success = false;
      console.log('Error executing statement, but will continue with remaining statements.');
    }
  }

  if (success) {
    console.log('======================================');
    console.log('✅ Migration completed successfully!');
    console.log('======================================');
  } else {
    console.log('======================================');
    console.log('⚠️ Migration completed with some errors.');
    console.log('You may need to run the following SQL manually in the Supabase dashboard:');
    console.log('======================================');
    sqlStatements.forEach(sql => console.log(sql));
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
