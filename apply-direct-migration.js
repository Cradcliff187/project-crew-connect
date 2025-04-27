// Script to directly apply the source_item_id column using Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

async function applyMigrationDirectly() {
  try {
    console.log('Starting direct migration for source_item_id column...');

    // Check if the column already exists to avoid duplicate work
    console.log('Checking if the column already exists...');

    try {
      const { data: columnData, error: columnError } = await supabase
        .from('estimate_items')
        .select('source_item_id')
        .limit(1);

      if (!columnError) {
        console.log('The source_item_id column already exists!');
        console.log('No migration needed.');
        return;
      }
    } catch (err) {
      console.log('Column does not exist, proceeding with migration...');
    }

    // Use the Supabase REST API directly to execute the SQL statement
    console.log('Adding source_item_id column...');

    try {
      // First attempt: Use REST API to execute SQL
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabase.supabaseKey,
          Authorization: `Bearer ${supabase.supabaseKey}`,
          Prefer: 'params=single-object',
        },
        body: JSON.stringify({
          query: `ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;`,
        }),
      });

      const result = await response.text();
      console.log('Response from alter table attempt:', result);

      // Check if the column was added successfully
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('estimate_items')
          .select('source_item_id')
          .limit(1);

        if (!verifyError) {
          console.log('✅ Column was successfully added!');

          // Now add the comment and index
          console.log('Adding comment and index...');
          const commentResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabase.supabaseKey,
              Authorization: `Bearer ${supabase.supabaseKey}`,
              Prefer: 'params=single-object',
            },
            body: JSON.stringify({
              query: `COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';`,
            }),
          });

          const indexResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabase.supabaseKey,
              Authorization: `Bearer ${supabase.supabaseKey}`,
              Prefer: 'params=single-object',
            },
            body: JSON.stringify({
              query: `CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);`,
            }),
          });

          console.log('Migration completed successfully!');
          console.log('The source_item_id column is now available in the estimate_items table.');
        } else {
          console.error('Column may not have been added:', verifyError);

          // Provide SQL for manual execution
          console.log('\nPlease run the following SQL manually in the Supabase dashboard:');
          console.log(`
-- Add the column to track source items
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
          `);
        }
      } catch (err) {
        console.error('Error verifying column:', err);

        // Provide SQL for manual execution
        console.log('\nPlease run the following SQL manually in the Supabase dashboard:');
        console.log(`
-- Add the column to track source items
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
        `);
      }
    } catch (error) {
      console.error('Error applying migration directly:', error);

      // Provide SQL for manual execution
      console.log('\nPlease run the following SQL manually in the Supabase dashboard:');
      console.log(`
-- Add the column to track source items
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
      `);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigrationDirectly();
