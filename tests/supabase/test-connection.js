// Script to test Supabase connection and check for source_item_id column
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test connection by querying for a row from estimate_items
    const { data, error } = await supabase.from('estimate_items').select('*').limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log(`Retrieved ${data ? data.length : 0} items`);

    if (data && data.length > 0) {
      console.log('First item structure:', Object.keys(data[0]));

      // Check if source_item_id exists
      const hasSourceItemId = Object.keys(data[0]).includes('source_item_id');
      console.log(`source_item_id column exists: ${hasSourceItemId ? 'YES' : 'NO'}`);

      if (hasSourceItemId) {
        console.log('The column is already present. No migration needed.');
      } else {
        console.log('The column does not exist. Migration is needed.');
        console.log('Please run the following SQL in the Supabase dashboard:');
        console.log(`
-- Add the column to track source items
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);
        `);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testConnection();
