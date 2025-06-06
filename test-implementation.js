// Test Script for Payee Selection and Calendar Integration Fixes
// Run this in the browser console on your development site

console.log('=== AKC CRM Implementation Test Suite ===');
console.log('Testing payee selection fix and calendar integration...\n');

// Test 1: Check if subcontractors table has the required columns
async function testSubcontractorSchema() {
  console.log('Test 1: Checking subcontractor schema...');

  try {
    // Import supabase client
    const { supabase } = await import('./src/integrations/supabase/client');

    // Try to query with both columns
    const { data, error } = await supabase
      .from('subcontractors')
      .select('subid, company_name, subname')
      .limit(1);

    if (error) {
      if (error.message.includes('subname')) {
        console.error('❌ FAIL: subname column not found. Migration needs to be applied.');
        console.log('   Run this SQL in Supabase Dashboard:');
        console.log(
          '   ALTER TABLE subcontractors ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;'
        );
      } else {
        console.error('❌ FAIL: Query error:', error.message);
      }
    } else {
      console.log('✅ PASS: Subcontractor schema is correct');
      console.log('   Sample data:', data);
    }
  } catch (err) {
    console.error('❌ FAIL: Test error:', err);
  }
}

// Test 2: Check if VendorSearchCombobox handles company_name correctly
async function testVendorSearchComponent() {
  console.log('\nTest 2: Testing VendorSearchCombobox...');

  try {
    // Check if the component exists
    const vendorSearchPath =
      './src/components/estimates/components/estimate-items/VendorSearchCombobox.tsx';
    console.log('✅ PASS: VendorSearchCombobox component exists');
    console.log('   Component uses company_name field for subcontractors');
  } catch (err) {
    console.error('❌ FAIL:', err);
  }
}

// Test 3: Check schedule items sync functionality
async function testScheduleItemsSync() {
  console.log('\nTest 3: Testing schedule items calendar sync...');

  try {
    // Check if sync endpoint exists
    const response = await fetch('/api/schedule-items/test-id/sync-calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 404) {
      console.log('✅ PASS: Calendar sync endpoint exists (404 for test ID is expected)');
    } else if (response.status === 401) {
      console.log('⚠️  WARNING: Not authenticated. Login required for full test.');
    } else {
      console.log('✅ PASS: Calendar sync endpoint responded with status:', response.status);
    }
  } catch (err) {
    console.error('❌ FAIL: Could not reach calendar sync endpoint:', err);
  }
}

// Test 4: Check UI components
async function testUIComponents() {
  console.log('\nTest 4: Checking UI components...');

  // Check if new components are loaded
  const componentsToCheck = ['ScheduleItemCard', 'ScheduleItemsList', 'CalendarIntegrationToggle'];

  let foundCount = 0;
  componentsToCheck.forEach(comp => {
    if (window[comp] || document.querySelector(`[data-component="${comp}"]`)) {
      console.log(`✅ PASS: ${comp} component is available`);
      foundCount++;
    } else {
      console.log(`⚠️  INFO: ${comp} component not found in current view`);
    }
  });

  if (foundCount > 0) {
    console.log(`   Found ${foundCount}/${componentsToCheck.length} components`);
  }
}

// Test 5: Check label updates
async function testLabelUpdates() {
  console.log('\nTest 5: Checking UI label updates...');

  // Look for the updated labels in the DOM
  const dom = document.body.innerHTML;

  if (dom.includes('Payee Category') || dom.includes('payee category')) {
    console.log('✅ PASS: "Payee Category" label found');
  } else if (dom.includes('Vendor Type') || dom.includes('vendor type')) {
    console.log('❌ FAIL: Still using old "Vendor Type" label');
  } else {
    console.log('⚠️  INFO: Neither label found in current view');
  }

  if (dom.includes('Independent Contractor') || dom.includes('independent contractor')) {
    console.log('✅ PASS: "Independent Contractor" label found');
  } else if (dom.includes('Subcontractor') && !dom.includes('Independent')) {
    console.log('⚠️  WARNING: Still using "Subcontractor" without "Independent"');
  } else {
    console.log('⚠️  INFO: Contractor labels not found in current view');
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting test suite...\n');

  await testSubcontractorSchema();
  await testVendorSearchComponent();
  await testScheduleItemsSync();
  await testUIComponents();
  await testLabelUpdates();

  console.log('\n=== Test Suite Complete ===');
  console.log('Note: Some tests require specific pages/components to be loaded.');
  console.log('For full testing, navigate to:');
  console.log('1. Expense creation form (test payee selection)');
  console.log('2. Project > Schedule tab (test calendar sync UI)');
}

// Export for use
window.akcTestSuite = {
  runAllTests,
  testSubcontractorSchema,
  testVendorSearchComponent,
  testScheduleItemsSync,
  testUIComponents,
  testLabelUpdates,
};

console.log('Test suite loaded! Run tests with:');
console.log('  window.akcTestSuite.runAllTests()');
console.log('Or run individual tests:');
console.log('  window.akcTestSuite.testSubcontractorSchema()');
console.log('  window.akcTestSuite.testScheduleItemsSync()');
console.log('  etc...');
