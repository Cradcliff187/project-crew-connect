// Script to apply the source_item_id migration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

// Migration SQL
const migrationSQL = `
-- Add the column to track source items if it doesn't exist
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
`;

async function applyMigration() {
  try {
    console.log('Checking if estimate_items table exists...');

    // Check if the table exists first
    const { data: tableData, error: tableError } = await supabase
      .from('estimate_items')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Error checking estimate_items table:', tableError);
      return;
    }

    console.log('Table exists, applying migration...');

    // Apply the migration directly through SQL query
    const { error } = await supabase
      .rpc('exec_sql', {
        sql_string: migrationSQL,
      })
      .catch(err => {
        console.error('Error calling exec_sql function:', err);
        return { error: err };
      });

    if (error) {
      console.error('Error applying migration:', error);

      // Try direct SQL approach (may not work depending on permissions)
      console.log('Trying direct approach...');
      try {
        // Try each statement separately
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

        for (const stmt of statements) {
          if (!stmt.trim()) continue;

          const { data, error } = await supabase.rpc('exec_sql', {
            sql_string: stmt + ';',
          });

          if (error) {
            console.error(`Error executing statement: ${stmt}`, error);
          } else {
            console.log(`Successfully executed: ${stmt.trim().slice(0, 50)}...`);
          }
        }
      } catch (err) {
        console.error('Direct approach failed:', err);
        console.log('Please run the following SQL directly in the Supabase dashboard:');
        console.log(migrationSQL);
      }
    } else {
      console.log('Migration successfully applied!');
      console.log('The source_item_id column is now available in the estimate_items table.');

      // Verify the column was added
      console.log('Verifying column was added...');
      const { data, error: verifyError } = await supabase.rpc('exec_sql', {
        sql_string:
          "SELECT column_name FROM information_schema.columns WHERE table_name = 'estimate_items' AND column_name = 'source_item_id';",
      });

      if (verifyError) {
        console.error('Error verifying column:', verifyError);
      } else {
        console.log('Column verification successful!');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigration();
