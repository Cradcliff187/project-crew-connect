// Deployment Monitoring Script
// This script monitors the deployment and tests the implemented fixes

const DEPLOYMENT_URL = 'https://project-crew-connect-1061142868787.us-east5.run.app';
const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

console.log('=== AKC CRM Deployment Monitor ===\n');

// Test 1: Check if application is accessible
async function checkApplicationHealth() {
  console.log('1. Checking application health...');

  try {
    const response = await fetch(DEPLOYMENT_URL);
    if (response.ok) {
      console.log('✅ Application is accessible (Status:', response.status + ')');
      return true;
    } else {
      console.error('❌ Application returned error status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to reach application:', error.message);
    return false;
  }
}

// Test 2: Check if database migration was applied
async function checkDatabaseMigration() {
  console.log('\n2. Checking database migration status...');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?limit=1&select=subid,company_name,subname`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subcontractors table accessible');

      if (data.length > 0 && 'subname' in data[0]) {
        console.log('✅ Migration applied! subname column exists');
        console.log('   Sample data:', JSON.stringify(data[0], null, 2));
        return true;
      } else {
        console.log('⚠️  Migration not yet applied - subname column not found');
        console.log('   Apply this SQL in Supabase Dashboard:');
        console.log(
          '   ALTER TABLE subcontractors ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;'
        );
        return false;
      }
    } else {
      const error = await response.text();
      if (error.includes('column subcontractors.subname does not exist')) {
        console.log('❌ Migration not applied - subname column missing');
        return false;
      }
      console.error('❌ Database query failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check database:', error.message);
    return false;
  }
}

// Test 3: Test vendor search functionality
async function testVendorSearch() {
  console.log('\n3. Testing vendor search functionality...');

  try {
    // Test searching for subcontractors
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/subcontractors?select=subid,company_name&company_name=ilike.%test%&limit=5`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (response.ok) {
      console.log('✅ Vendor search API working with company_name field');
      const data = await response.json();
      console.log(`   Found ${data.length} subcontractors`);
      return true;
    } else {
      console.error('❌ Vendor search failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to test vendor search:', error.message);
    return false;
  }
}

// Test 4: Check calendar sync endpoint
async function checkCalendarSync() {
  console.log('\n4. Checking calendar sync endpoint...');

  try {
    const response = await fetch(`${DEPLOYMENT_URL}/api/schedule-items/test-id/sync-calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.log('✅ Calendar sync endpoint exists (authentication required)');
      return true;
    } else if (response.status === 404) {
      console.log('✅ Calendar sync endpoint exists (test ID not found as expected)');
      return true;
    } else {
      console.log('⚠️  Unexpected response from calendar endpoint:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to reach calendar endpoint:', error.message);
    return false;
  }
}

// Monitor deployment status
async function monitorDeployment() {
  console.log('Starting deployment monitoring...\n');

  const results = {
    appHealth: await checkApplicationHealth(),
    dbMigration: await checkDatabaseMigration(),
    vendorSearch: await testVendorSearch(),
    calendarSync: await checkCalendarSync(),
  };

  console.log('\n=== Deployment Status Summary ===');
  console.log('Application Health:', results.appHealth ? '✅ PASS' : '❌ FAIL');
  console.log('Database Migration:', results.dbMigration ? '✅ PASS' : '⚠️  PENDING');
  console.log('Vendor Search:', results.vendorSearch ? '✅ PASS' : '❌ FAIL');
  console.log('Calendar Sync:', results.calendarSync ? '✅ PASS' : '❌ FAIL');

  const overallStatus = Object.values(results).every(r => r);
  console.log(
    '\nOverall Status:',
    overallStatus ? '✅ DEPLOYMENT SUCCESSFUL' : '⚠️  ACTION REQUIRED'
  );

  if (!results.dbMigration) {
    console.log('\n📋 Next Step: Apply database migration in Supabase Dashboard');
    console.log('Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/sql/new');
  }

  return results;
}

// Run monitoring
if (typeof window !== 'undefined') {
  // Browser environment
  window.akcDeploymentMonitor = {
    monitorDeployment,
    checkApplicationHealth,
    checkDatabaseMigration,
    testVendorSearch,
    checkCalendarSync,
  };

  console.log('Deployment monitor loaded! Run with:');
  console.log('  window.akcDeploymentMonitor.monitorDeployment()');
} else {
  // Node.js environment
  monitorDeployment().then(results => {
    process.exit(Object.values(results).every(r => r) ? 0 : 1);
  });
}
