// Script to apply the subname migration to Supabase
// This creates a generated column alias for backward compatibility

const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

// Migration SQL
const MIGRATION_SQL = `
-- Add subname as a generated column alias for company_name
-- This fixes the mismatch between frontend expectations and database schema
ALTER TABLE subcontractors
ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;

-- Create index on the generated column for better query performance
CREATE INDEX IF NOT EXISTS idx_subcontractors_subname ON subcontractors (subname);

-- Add comment explaining the column
COMMENT ON COLUMN subcontractors.subname IS 'Generated alias for company_name to maintain backward compatibility with frontend code';
`;

async function applyMigration() {
  console.log('🚀 Starting Supabase migration...\n');

  try {
    // First, check if the migration is already applied
    console.log('1. Checking current schema...');
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subid,company_name&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (checkResponse.ok) {
      const data = await checkResponse.json();
      console.log('✅ Connected to Supabase successfully');
      console.log('   Current schema sample:', JSON.stringify(data[0] || {}, null, 2));
    } else {
      throw new Error(`Failed to connect: ${checkResponse.status} ${checkResponse.statusText}`);
    }

    // Try to check if subname column exists
    console.log('\n2. Checking if subname column exists...');
    const subnameCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subname&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (subnameCheck.ok) {
      console.log('✅ Migration already applied! subname column exists.');
      return true;
    }

    // Apply the migration using RPC
    console.log('\n3. Applying migration...');
    console.log('   SQL:', MIGRATION_SQL.trim());

    // Try execute_sql_command first
    const cmdResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql_command`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_sql: MIGRATION_SQL,
      }),
    });

    if (cmdResponse.ok) {
      console.log('✅ Migration applied successfully using execute_sql_command!');
    } else {
      // Try pgmigration as fallback
      console.log('   Trying pgmigration fallback...');
      const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pgmigration`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: MIGRATION_SQL,
        }),
      });

      if (pgResponse.ok) {
        console.log('✅ Migration applied successfully using pgmigration!');
      } else {
        const error = await pgResponse.text();
        throw new Error(`Migration failed: ${error}`);
      }
    }

    // Verify the migration
    console.log('\n4. Verifying migration...');
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subid,company_name,subname&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      console.log(
        '✅ Migration verified! Schema now includes:',
        JSON.stringify(data[0] || {}, null, 2)
      );
      return true;
    } else {
      console.warn('⚠️  Could not verify migration, but it may have succeeded.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual Migration Steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/sql/new');
    console.log('2. Run this SQL:', MIGRATION_SQL);
    return false;
  }
}

// Helper to test payee selection after migration
async function testPayeeSelection() {
  console.log('\n\n🧪 Testing payee selection...');

  try {
    // Test vendor search
    console.log('\n1. Testing vendor search...');
    const vendorResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vendors?select=vendorid,vendorname&vendorname=ilike.%test%&limit=3`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (vendorResponse.ok) {
      const vendors = await vendorResponse.json();
      console.log(`✅ Vendor search working. Found ${vendors.length} vendors`);
    }

    // Test subcontractor search with company_name
    console.log('\n2. Testing subcontractor search with company_name...');
    const subResponse1 = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subid,company_name&company_name=ilike.%test%&limit=3`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (subResponse1.ok) {
      const subs = await subResponse1.json();
      console.log(
        `✅ Subcontractor search with company_name working. Found ${subs.length} subcontractors`
      );
    }

    // Test subcontractor search with subname (should work after migration)
    console.log('\n3. Testing subcontractor search with subname...');
    const subResponse2 = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subid,subname&subname=ilike.%test%&limit=3`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (subResponse2.ok) {
      const subs = await subResponse2.json();
      console.log(
        `✅ Subcontractor search with subname working! Found ${subs.length} subcontractors`
      );
      console.log('   Sample:', JSON.stringify(subs[0] || {}, null, 2));
    } else {
      console.log('❌ Subcontractor search with subname failed - migration may not be applied');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the migration and tests
console.log('=== AKC CRM Payee Selection Migration ===');
console.log('This script will:');
console.log('1. Add subname column as alias for company_name');
console.log('2. Fix payee selection in expense forms');
console.log('3. Test the implementation\n');

applyMigration().then(success => {
  if (success) {
    testPayeeSelection();
  }
});
