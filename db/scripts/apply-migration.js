// Simple script to apply the migration to add source_item_id column
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

// SQL for adding the column
const migrationSql = `
-- Add the column to track source items if it doesn't exist
ALTER TABLE IF EXISTS estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN IF EXISTS estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
`;

async function applyMigration() {
  try {
    console.log('Applying migration to add source_item_id column...');

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('pgmigration', { sql: migrationSql });

    if (error) {
      console.error('Error applying migration:', error);
      return;
    }

    console.log('Migration successful!');
    console.log('You can now use the source_item_id column in your code.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigration();
