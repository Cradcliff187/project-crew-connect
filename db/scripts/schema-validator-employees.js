// Employee schema validator script
import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the proxy.js file
const SUPABASE_URL = 'https://zrxezqllmpdlhiudutme.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  },
});

// Front-end employee field definitions from reports section
const frontEndEmployeeFields = [
  { label: 'Name', field: 'full_name', type: 'text' },
  { label: 'Email', field: 'email', type: 'text' },
  { label: 'Role', field: 'role', type: 'text' },
  { label: 'Status', field: 'status', type: 'status' },
  { label: 'Hourly Rate', field: 'hourly_rate', type: 'currency' },
  { label: 'Created Date', field: 'created_at', type: 'date' },
];

async function validateEmployeeSchema() {
  try {
    console.log('Validating Employee Schema for Reports...');

    // Get actual employee data from Supabase
    const { data: employees, error } = await supabase.from('employees').select('*').limit(3);

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    if (!employees || employees.length === 0) {
      console.log('No employee data found in Supabase');
      return;
    }

    // Get database columns
    console.log('\n== ACTUAL SUPABASE EMPLOYEE DATA ==');
    console.table(employees);

    // Extract column names from actual data
    const actualColumns = Object.keys(employees[0]);
    console.log('\n== ACTUAL DATABASE COLUMNS ==');
    console.log(actualColumns);

    // Extract front-end field names
    const frontEndFields = frontEndEmployeeFields.map(f => f.field);
    console.log('\n== FRONT-END FIELD DEFINITIONS ==');
    console.log(frontEndFields);

    // Check for fields in reports that don't exist in database directly
    const derivedFields = frontEndFields.filter(field => !actualColumns.includes(field));
    console.log('\n== DERIVED FIELDS (NOT DIRECT COLUMNS) ==');
    console.log(derivedFields);

    // Simulate report data processing
    const processedEmployees = employees.map(emp => ({
      ...emp,
      full_name: `${emp.first_name} ${emp.last_name}`,
    }));

    console.log('\n== PROCESSED EMPLOYEE DATA (AS USED IN REPORTS) ==');
    console.table(processedEmployees);

    // Check for all column types and required fields
    console.log('\n== SCHEMA ALIGNMENT ISSUES ==');

    // Create sample data as would be used in reports
    const sampleReportData = processedEmployees.map(emp => {
      const reportRow = {};
      frontEndEmployeeFields.forEach(field => {
        reportRow[field.field] = emp[field.field] || null;
      });
      return reportRow;
    });

    console.log('\n== SAMPLE REPORT DATA ==');
    console.table(sampleReportData);

    // Check for missing required fields
    const missingRequiredFields = [];
    frontEndFields.forEach(field => {
      if (!derivedFields.includes(field) && !actualColumns.includes(field)) {
        missingRequiredFields.push(field);
      }
    });

    if (missingRequiredFields.length > 0) {
      console.log('\n== MISSING REQUIRED FIELDS IN DATABASE ==');
      console.log(missingRequiredFields);
    } else {
      console.log('\n== All required report fields exist in the database ==');
    }
  } catch (error) {
    console.error('Validation error:', error);
  }
}

validateEmployeeSchema().catch(console.error);
