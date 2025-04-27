// Script to directly apply the migration for source_item_id column
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

async function applyMigration() {
  try {
    console.log('Applying migration to add source_item_id column...');

    // Apply each SQL statement separately

    // 1. Add the column
    const { error: columnError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;',
    });

    if (columnError) {
      console.error('Error adding column:', columnError);

      // Try alternative approach if RPC doesn't work
      console.log('Trying alternative approach with raw SQL...');
      const { error: alterError } = await supabase
        .from('_queries')
        .select('*')
        .csv()
        .execute('ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;');

      if (alterError) {
        console.error('Error with alternative approach:', alterError);
        console.log('Attempting direct approach with SQL query...');

        // Most direct approach
        const { data, error: directError } = await supabase.auth.getSession();
        if (directError) {
          console.error('Error getting session:', directError);
          return;
        }

        const token = data.session?.access_token;
        if (!token) {
          console.error('No access token available');
          return;
        }

        // Try to use supabase.sql
        try {
          const { error: sqlError } = await supabase.sql`
            ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;
          `;

          if (sqlError) {
            console.error('Error with SQL query:', sqlError);
            return;
          }
        } catch (err) {
          console.error('Error executing SQL directly:', err);
          console.log('Please run this SQL manually through the Supabase dashboard:');
          console.log('ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;');
          console.log(
            "COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';"
          );
          console.log(
            'CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);'
          );
          return;
        }
      }
    }

    // 2. Add the comment
    const { error: commentError } = await supabase.rpc('execute_sql', {
      sql: "COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';",
    });

    if (commentError) {
      console.error('Error adding comment:', commentError);
    }

    // 3. Create the index
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);',
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
    }

    if (!columnError && !commentError && !indexError) {
      console.log('Migration successful!');
      console.log('You can now use the source_item_id column in your code.');
    } else {
      console.log('Migration may not have been fully applied due to errors.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigration();
