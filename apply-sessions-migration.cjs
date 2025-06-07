// Script to apply the sessions table migration to Supabase
// This creates a table for storing Google OAuth sessions

const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

// Migration SQL
const MIGRATION_SQL = `
-- Create sessions table for storing Google OAuth sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  tokens JSONB NOT NULL,
  user_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_email ON sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- Add comment
COMMENT ON TABLE sessions IS 'Stores Google OAuth session data for calendar integration';
`;

async function applyMigration() {
  console.log('🚀 Starting Sessions Table Migration...\n');

  try {
    // First, check if the table already exists
    console.log('1. Checking if sessions table exists...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'count=exact',
      },
    });

    if (checkResponse.ok) {
      console.log('✅ Sessions table already exists!');
      return true;
    }

    // Apply the migration
    console.log('\n2. Creating sessions table...');

    // We need to execute this SQL directly
    // Try different RPC endpoints
    const endpoints = ['execute_sql', 'execute_sql_command', 'pgmigration'];
    let migrationApplied = false;

    for (const endpoint of endpoints) {
      console.log(`   Trying ${endpoint}...`);

      const body = endpoint === 'pgmigration' ? { sql: MIGRATION_SQL } : { p_sql: MIGRATION_SQL };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${endpoint}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`✅ Migration applied successfully using ${endpoint}!`);
        migrationApplied = true;
        break;
      }
    }

    if (!migrationApplied) {
      throw new Error('Could not apply migration through any RPC endpoint');
    }

    // Verify the migration
    console.log('\n3. Verifying migration...');
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (verifyResponse.ok) {
      console.log('✅ Sessions table created successfully!');
      return true;
    } else {
      console.warn('⚠️  Could not verify table creation, but it may have succeeded.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual Migration Steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/sql/new');
    console.log('2. Copy and paste this SQL:');
    console.log('\n' + MIGRATION_SQL);
    console.log('\n3. Click "Run" button');
    return false;
  }
}

// Test session operations
async function testSessionOperations() {
  console.log('\n\n🧪 Testing session operations...');

  try {
    const testSession = {
      id: 'test-' + Date.now(),
      user_email: 'test@example.com',
      tokens: { access_token: 'test-token', refresh_token: 'test-refresh' },
      expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    };

    // Test insert
    console.log('\n1. Testing session insert...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(testSession),
    });

    if (insertResponse.ok) {
      const inserted = await insertResponse.json();
      console.log('✅ Session insert working');

      // Test select
      console.log('\n2. Testing session retrieval...');
      const selectResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/sessions?id=eq.${testSession.id}`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );

      if (selectResponse.ok) {
        const data = await selectResponse.json();
        console.log('✅ Session retrieval working');
      }

      // Clean up test data
      console.log('\n3. Cleaning up test data...');
      await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${testSession.id}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      });
      console.log('✅ Test data cleaned up');
    } else {
      console.log('❌ Session operations test failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the migration
console.log('=== Google OAuth Sessions Table Migration ===');
console.log('This will create a sessions table for storing OAuth tokens\n');

applyMigration().then(success => {
  if (success) {
    testSessionOperations();
  }
});
