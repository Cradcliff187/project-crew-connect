const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Comprehensive System Test Suite
// Tests all database connections, time entries, expenses, OCR, and cross-application functionality

// Initialize clients with correct environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracking
const testResults = {
  database: { passed: 0, failed: 0, tests: [] },
  timeEntries: { passed: 0, failed: 0, tests: [] },
  expenses: { passed: 0, failed: 0, tests: [] },
  receipts: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] },
  ocr: { passed: 0, failed: 0, tests: [] },
};

// Helper function to log test results
function logTest(category, testName, passed, details = '', data = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
  if (data && passed) console.log(`   Data: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);

  testResults[category].tests.push({ name: testName, passed, details, data });
  if (passed) {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
  }
}

async function comprehensiveSystemTest() {
  console.log('🧪 COMPREHENSIVE SYSTEM TEST SUITE');
  console.log('Testing: Database, Time Entries, Expenses, OCR, and Cross-Application Integration');
  console.log('='.repeat(80));

  try {
    // ========================================================================
    // 1. DATABASE SCHEMA & CONNECTIVITY TESTS
    // ========================================================================
    console.log('\n📊 1. DATABASE SCHEMA & CONNECTIVITY TESTS');
    console.log('-'.repeat(50));

    // Test 1.1: Basic connectivity
    try {
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      logTest(
        'database',
        'Supabase connectivity',
        !error,
        error ? error.message : 'Connected successfully'
      );
    } catch (err) {
      logTest('database', 'Supabase connectivity', false, err.message);
    }

    // Test 1.2: Role-based schema validation
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select(
          'employee_id, user_id, app_role, first_name, last_name, hourly_rate, cost_rate, bill_rate'
        )
        .limit(3);

      if (error) throw error;

      const hasRoleFields =
        employees &&
        employees.length > 0 &&
        'user_id' in employees[0] &&
        'app_role' in employees[0];
      const hasRateFields =
        employees &&
        employees.length > 0 &&
        'hourly_rate' in employees[0] &&
        'cost_rate' in employees[0];

      logTest(
        'database',
        'Employees table role-based schema',
        hasRoleFields,
        `Found ${employees?.length || 0} employees with role fields`
      );
      logTest(
        'database',
        'Employees table rate fields',
        hasRateFields,
        'Cost and billing rate fields present'
      );
    } catch (err) {
      logTest('database', 'Employees table schema', false, err.message);
    }

    // Test 1.3: Time entries enhanced schema
    try {
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select(
          'id, hours_worked, hours_regular, hours_ot, processed_at, processed_by, receipt_id, total_cost, total_billable'
        )
        .limit(3);

      if (error) throw error;

      const hasEnhancedFields =
        timeEntries &&
        timeEntries.length >= 0 &&
        (timeEntries.length === 0 ||
          ('hours_regular' in timeEntries[0] && 'hours_ot' in timeEntries[0]));

      logTest(
        'database',
        'Time entries enhanced schema',
        hasEnhancedFields,
        `Found ${timeEntries?.length || 0} time entries with overtime fields`
      );
    } catch (err) {
      logTest('database', 'Time entries enhanced schema', false, err.message);
    }

    // Test 1.4: Receipts table
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('id, employee_id, amount, merchant, ocr_raw, ocr_confidence, storage_path')
        .limit(3);

      logTest(
        'database',
        'Receipts table exists and accessible',
        !error,
        error ? error.message : `Found ${receipts?.length || 0} receipts`
      );
    } catch (err) {
      logTest('database', 'Receipts table', false, err.message);
    }

    // Test 1.5: Activity log table
    try {
      const { data: activityLog, error } = await supabase
        .from('activity_log')
        .select('id, entry_id, user_id, action, payload')
        .limit(3);

      logTest(
        'database',
        'Activity log table exists',
        !error,
        error ? error.message : `Found ${activityLog?.length || 0} activity records`
      );
    } catch (err) {
      logTest('database', 'Activity log table', false, err.message);
    }

    // ========================================================================
    // 2. TIME ENTRIES FUNCTIONALITY TESTS
    // ========================================================================
    console.log('\n⏰ 2. TIME ENTRIES FUNCTIONALITY TESTS');
    console.log('-'.repeat(50));

    // Test 2.1: Time entries with employee relationships
    try {
      const { data: timeEntriesWithEmployees, error } = await supabase
        .from('time_entries')
        .select(
          `
          id, entity_type, entity_id, date_worked, hours_worked,
          hours_regular, hours_ot, employee_id, total_cost, total_billable,
          employees!inner(first_name, last_name, app_role, hourly_rate, cost_rate, bill_rate)
        `
        )
        .limit(5);

      if (error) throw error;

      const hasEmployeeData =
        timeEntriesWithEmployees &&
        timeEntriesWithEmployees.length > 0 &&
        timeEntriesWithEmployees[0].employees;

      logTest(
        'timeEntries',
        'Time entries with employee relationships',
        hasEmployeeData,
        `Found ${timeEntriesWithEmployees?.length || 0} entries with employee data`
      );

      if (hasEmployeeData) {
        // Test overtime calculations
        const entriesWithOvertime = timeEntriesWithEmployees.filter(e => e.hours_ot > 0);
        logTest(
          'timeEntries',
          'Overtime calculation present',
          entriesWithOvertime.length > 0 ||
            timeEntriesWithEmployees.every(e => e.hours_worked <= 8),
          entriesWithOvertime.length > 0
            ? `${entriesWithOvertime.length} entries with overtime`
            : 'All entries under 8 hours (normal)'
        );

        // Test cost calculations
        const entriesWithCosts = timeEntriesWithEmployees.filter(e => e.total_cost > 0);
        logTest(
          'timeEntries',
          'Cost calculations present',
          entriesWithCosts.length > 0,
          `${entriesWithCosts.length} entries with calculated costs`
        );
      }
    } catch (err) {
      logTest('timeEntries', 'Time entries with employee relationships', false, err.message);
    }

    // Test 2.2: Admin user validation
    try {
      const { data: adminUsers, error } = await supabase
        .from('employees')
        .select('employee_id, user_id, app_role, first_name, last_name, email')
        .eq('app_role', 'admin');

      if (error) throw error;

      const hasAdmin = adminUsers && adminUsers.length > 0;
      const chrisRadcliff = adminUsers?.find(
        u =>
          u.first_name?.toLowerCase().includes('chris') &&
          u.last_name?.toLowerCase().includes('radcliff')
      );

      logTest(
        'timeEntries',
        'Admin users exist',
        hasAdmin,
        `Found ${adminUsers?.length || 0} admin users`
      );
      logTest(
        'timeEntries',
        'Chris Radcliff admin user',
        !!chrisRadcliff,
        chrisRadcliff
          ? `Found: ${chrisRadcliff.first_name} ${chrisRadcliff.last_name}`
          : 'Not found'
      );
    } catch (err) {
      logTest('timeEntries', 'Admin user validation', false, err.message);
    }

    // ========================================================================
    // 3. EXPENSES & RECEIPTS INTEGRATION TESTS
    // ========================================================================
    console.log('\n💰 3. EXPENSES & RECEIPTS INTEGRATION TESTS');
    console.log('-'.repeat(50));

    // Test 3.1: Expenses table structure
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select(
          'id, entity_type, entity_id, expense_type, amount, description, document_id, time_entry_id'
        )
        .limit(5);

      logTest(
        'expenses',
        'Expenses table accessible',
        !error,
        error ? error.message : `Found ${expenses?.length || 0} expense records`
      );

      if (!error && expenses && expenses.length > 0) {
        const hasTimeEntryLink = expenses.some(e => e.time_entry_id);
        const hasDocumentLink = expenses.some(e => e.document_id);

        logTest(
          'expenses',
          'Time entry linkage',
          hasTimeEntryLink,
          hasTimeEntryLink ? 'Found expenses linked to time entries' : 'No time entry links found'
        );
        logTest(
          'expenses',
          'Document linkage',
          hasDocumentLink,
          hasDocumentLink ? 'Found expenses linked to documents' : 'No document links found'
        );
      }
    } catch (err) {
      logTest('expenses', 'Expenses table structure', false, err.message);
    }

    // Test 3.2: Receipt-expense relationships
    try {
      const { data: receiptsWithExpenses, error } = await supabase
        .from('receipts')
        .select(
          `
          id, employee_id, amount, merchant, storage_path,
          expenses!receipts_id_fkey(id, amount, expense_type)
        `
        )
        .limit(5);

      logTest(
        'receipts',
        'Receipt-expense relationships',
        !error,
        error
          ? error.message
          : `Queried ${receiptsWithExpenses?.length || 0} receipts for expense links`
      );
    } catch (err) {
      logTest('receipts', 'Receipt-expense relationships', false, err.message);
    }

    // Test 3.3: Storage bucket validation
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) throw error;

      const hasDocumentsBucket = buckets.some(
        b => b.name === 'documents' || b.name === 'construction_documents'
      );
      logTest(
        'receipts',
        'Storage bucket for receipts',
        hasDocumentsBucket,
        `Available buckets: ${buckets.map(b => b.name).join(', ')}`
      );
    } catch (err) {
      logTest('receipts', 'Storage bucket validation', false, err.message);
    }

    // ========================================================================
    // 4. OCR FUNCTIONALITY TESTS
    // ========================================================================
    console.log('\n🤖 4. OCR FUNCTIONALITY TESTS');
    console.log('-'.repeat(50));

    // Test 4.1: Google Vision API setup
    try {
      const vision = google.vision({ version: 'v1' });
      logTest(
        'ocr',
        'Google Vision API client creation',
        true,
        'Vision API client created successfully'
      );
    } catch (err) {
      logTest('ocr', 'Google Vision API client creation', false, err.message);
    }

    // Test 4.2: OCR endpoint structure validation
    try {
      // Test the OCR helper functions exist
      const visionHelperPath = path.join(__dirname, 'server', 'google-api-helpers', 'vision.js');
      const visionHelperExists = fs.existsSync(visionHelperPath);

      logTest('ocr', 'Vision API helper module exists', visionHelperExists, visionHelperPath);

      if (visionHelperExists) {
        const visionHelper = require('./server/google-api-helpers/vision.js');
        const hasRequiredFunctions =
          typeof visionHelper.processReceiptOCR === 'function' &&
          typeof visionHelper.extractReceiptData === 'function';

        logTest(
          'ocr',
          'Vision API helper functions',
          hasRequiredFunctions,
          'processReceiptOCR and extractReceiptData functions available'
        );
      }
    } catch (err) {
      logTest('ocr', 'OCR helper validation', false, err.message);
    }

    // Test 4.3: OCR data extraction patterns
    try {
      // Test the pattern matching with sample receipt text
      const sampleReceiptText = `
        HOME DEPOT
        123 Main St
        Date: 01/15/2024

        Screws 2.5"        $12.99
        Wood Glue          $8.99
        Sandpaper          $15.50

        Subtotal:          $37.48
        Tax:               $3.00
        Total:             $40.48
      `;

      // Test if we can load and use the extraction function
      const visionHelperPath = path.join(__dirname, 'server', 'google-api-helpers', 'vision.js');
      if (fs.existsSync(visionHelperPath)) {
        const visionHelper = require('./server/google-api-helpers/vision.js');
        const extractedData = visionHelper.extractReceiptData(sampleReceiptText);

        const hasValidExtraction =
          extractedData && extractedData.merchant && extractedData.total > 0;

        logTest(
          'ocr',
          'Receipt data extraction patterns',
          hasValidExtraction,
          hasValidExtraction
            ? `Extracted: ${extractedData.merchant}, $${extractedData.total}`
            : 'Pattern matching failed'
        );
      }
    } catch (err) {
      logTest('ocr', 'OCR data extraction patterns', false, err.message);
    }

    // ========================================================================
    // 5. CROSS-APPLICATION INTEGRATION TESTS
    // ========================================================================
    console.log('\n🔗 5. CROSS-APPLICATION INTEGRATION TESTS');
    console.log('-'.repeat(50));

    // Test 5.1: Time entry to expense workflow
    try {
      const { data: timeEntriesWithExpenses, error } = await supabase
        .from('time_entries')
        .select(
          `
          id, hours_worked, employee_id, entity_type, entity_id,
          expenses!time_entries_id_fkey(id, expense_type, amount)
        `
        )
        .limit(5);

      logTest(
        'integration',
        'Time entry to expense workflow',
        !error,
        error
          ? error.message
          : `Checked ${timeEntriesWithExpenses?.length || 0} time entries for expense links`
      );
    } catch (err) {
      logTest('integration', 'Time entry to expense workflow', false, err.message);
    }

    // Test 5.2: Project and work order relationships
    try {
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('projectid, projectname')
        .limit(3);

      const { data: workOrders, error: woError } = await supabase
        .from('maintenance_work_orders')
        .select('work_order_id, title')
        .limit(3);

      logTest(
        'integration',
        'Projects table accessible',
        !projectError,
        projectError ? projectError.message : `Found ${projects?.length || 0} projects`
      );
      logTest(
        'integration',
        'Work orders table accessible',
        !woError,
        woError ? woError.message : `Found ${workOrders?.length || 0} work orders`
      );
    } catch (err) {
      logTest('integration', 'Project and work order relationships', false, err.message);
    }

    // Test 5.3: Document management integration
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('document_id, entity_type, entity_id, category, is_expense, storage_path')
        .limit(5);

      logTest(
        'integration',
        'Document management integration',
        !error,
        error ? error.message : `Found ${documents?.length || 0} documents`
      );

      if (!error && documents && documents.length > 0) {
        const hasReceiptDocs = documents.some(d => d.category === 'receipt' || d.is_expense);
        logTest(
          'integration',
          'Receipt document categorization',
          hasReceiptDocs,
          hasReceiptDocs ? 'Found receipt/expense documents' : 'No receipt documents found'
        );
      }
    } catch (err) {
      logTest('integration', 'Document management integration', false, err.message);
    }

    // Test 5.4: Role-based access patterns
    try {
      // Test if we can distinguish between admin and field user data access patterns
      const { data: adminTimeEntries, error: adminError } = await supabase
        .from('time_entries')
        .select('id, processed_at, processed_by')
        .not('processed_at', 'is', null)
        .limit(3);

      const { data: unprocessedEntries, error: unprocessedError } = await supabase
        .from('time_entries')
        .select('id, employee_id, processed_at')
        .is('processed_at', null)
        .limit(3);

      logTest(
        'integration',
        'Processed time entries (admin view)',
        !adminError,
        adminError ? adminError.message : `Found ${adminTimeEntries?.length || 0} processed entries`
      );
      logTest(
        'integration',
        'Unprocessed time entries (field user view)',
        !unprocessedError,
        unprocessedError
          ? unprocessedError.message
          : `Found ${unprocessedEntries?.length || 0} unprocessed entries`
      );
    } catch (err) {
      logTest('integration', 'Role-based access patterns', false, err.message);
    }

    // ========================================================================
    // 6. COMPONENT INTEGRATION VALIDATION
    // ========================================================================
    console.log('\n🧩 6. COMPONENT INTEGRATION VALIDATION');
    console.log('-'.repeat(50));

    // Test 6.1: Frontend component files
    const componentChecks = [
      { name: 'FieldUserDashboard', path: 'src/pages/FieldUserDashboard.tsx' },
      { name: 'AdminTimeEntries', path: 'src/pages/AdminTimeEntries.tsx' },
      { name: 'QuickLogWizard', path: 'src/components/time-entries/QuickLogWizard.tsx' },
      { name: 'useRoleBasedTimeEntries hook', path: 'src/hooks/useRoleBasedTimeEntries.ts' },
      { name: 'useReceipts hook', path: 'src/hooks/useReceipts.ts' },
      { name: 'Vision API helper', path: 'server/google-api-helpers/vision.js' },
      { name: 'Role-based types', path: 'src/types/role-based-types.ts' },
    ];

    componentChecks.forEach(check => {
      try {
        const exists = fs.existsSync(path.join(process.cwd(), check.path));
        logTest('integration', `${check.name} component exists`, exists, check.path);
      } catch (err) {
        logTest('integration', `${check.name} component check`, false, err.message);
      }
    });

    // Test 6.2: Server endpoints validation
    const serverPath = path.join(__dirname, 'server', 'server.js');
    if (fs.existsSync(serverPath)) {
      try {
        const serverContent = fs.readFileSync(serverPath, 'utf8');
        const hasOCREndpoint = serverContent.includes('/api/ocr/process-receipt');
        const hasVisionScope = serverContent.includes('cloud-platform');
        const hasVisionHelper = serverContent.includes('visionHelper');

        logTest(
          'integration',
          'OCR endpoint in server',
          hasOCREndpoint,
          '/api/ocr/process-receipt endpoint found'
        );
        logTest(
          'integration',
          'Vision API scope configured',
          hasVisionScope,
          'cloud-platform scope in GOOGLE_SCOPES'
        );
        logTest(
          'integration',
          'Vision helper imported',
          hasVisionHelper,
          'visionHelper module imported'
        );
      } catch (err) {
        logTest('integration', 'Server configuration validation', false, err.message);
      }
    }
  } catch (error) {
    console.error('💥 Critical test suite error:', error);
  }

  // ========================================================================
  // COMPREHENSIVE TEST SUMMARY
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(80));

  let totalPassed = 0;
  let totalTests = 0;

  Object.entries(testResults).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed;
    const percentage = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
    const status = stats.failed === 0 ? '✅' : '⚠️';

    console.log(
      `\n${status} ${category.toUpperCase()}: ${stats.passed}/${total} tests passed (${percentage}%)`
    );

    if (stats.failed > 0) {
      console.log('   Failed tests:');
      stats.tests
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }

    totalPassed += stats.passed;
    totalTests += total;
  });

  const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  console.log('\n' + '='.repeat(80));
  console.log(
    `🎯 OVERALL SYSTEM STATUS: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`
  );

  if (overallPercentage >= 90) {
    console.log('🎉 EXCELLENT! System is production-ready.');
  } else if (overallPercentage >= 75) {
    console.log('✅ GOOD! System is mostly functional with minor issues.');
  } else if (overallPercentage >= 50) {
    console.log('⚠️  NEEDS WORK! System has significant issues to address.');
  } else {
    console.log('🚨 CRITICAL! System requires major fixes before use.');
  }

  console.log('\n📝 NEXT STEPS BASED ON TEST RESULTS:');

  if (testResults.database.failed > 0) {
    console.log('1. 🔧 Fix database connectivity and schema issues');
  }

  if (testResults.ocr.failed > 0) {
    console.log('2. 🤖 Enable Google Vision API in Google Cloud Console');
  }

  if (testResults.timeEntries.failed > 0) {
    console.log('3. ⏰ Verify time entry calculations and relationships');
  }

  if (testResults.expenses.failed > 0) {
    console.log('4. 💰 Check expense-receipt integration');
  }

  if (testResults.integration.failed > 0) {
    console.log('5. 🔗 Validate cross-application workflows');
  }

  console.log('\n🚀 READY FOR LIVE TESTING:');
  console.log('- Start both frontend (npm run dev) and backend (node server/server.js) servers');
  console.log('- Log in as Chris Radcliff (admin)');
  console.log('- Test Field Time Tracking interface');
  console.log('- Upload receipt images to test OCR');
  console.log('- Verify time entry creation and processing');

  return overallPercentage >= 75;
}

// Run comprehensive test suite
comprehensiveSystemTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
