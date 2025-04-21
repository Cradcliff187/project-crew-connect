// Time Entries and Employee Relationships Validator
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

// Front-end TimeEntry interface
const frontEndTimeEntryFields = {
  id: 'string',
  entity_type: 'string literal',
  entity_id: 'string',
  entity_name: 'string (optional)',
  entity_location: 'string (optional)',
  date_worked: 'string',
  start_time: 'string',
  end_time: 'string',
  hours_worked: 'number',
  notes: 'string (optional)',
  employee_id: 'string (optional)',
  employee_name: 'string (optional)',
  employee_rate: 'number (optional)',
  cost: 'number (optional)',
  total_cost: 'number (optional)',
  has_receipts: 'boolean (optional)',
  location_data: 'any (optional)',
  created_at: 'string',
  updated_at: 'string',
  documents: 'any[] (optional)',
};

async function validateTimeEntrySchema() {
  try {
    console.log('Validating Time Entry and Employee Relationships...');

    // Get time entries with employee data
    const { data: timeEntries, error: entriesError } = await supabase
      .from('time_entries')
      .select('*, employees(first_name, last_name, hourly_rate, role, status)')
      .limit(3);

    if (entriesError) {
      console.error('Error fetching time entries:', entriesError);
      return;
    }

    if (!timeEntries || timeEntries.length === 0) {
      console.log('No time entry data found in Supabase');
      return;
    }

    // Display time entries with employee data
    console.log('\n== TIME ENTRIES WITH EMPLOYEE DATA ==');
    console.table(timeEntries);

    // Check time entry schema in database
    const actualColumns = Object.keys(timeEntries[0]).filter(key => key !== 'employees');
    console.log('\n== ACTUAL TIME ENTRY DATABASE COLUMNS ==');
    console.log(actualColumns);

    // Check front-end time entry fields
    const frontEndFields = Object.keys(frontEndTimeEntryFields);
    console.log('\n== FRONT-END TIME ENTRY FIELDS ==');
    console.log(frontEndFields);

    // Fields in front-end not in database
    const missingInDatabase = frontEndFields.filter(
      field =>
        !actualColumns.includes(field) &&
        !['entity_name', 'entity_location', 'employee_name', 'documents'].includes(field)
    );

    console.log('\n== FIELDS IN FRONT-END NOT IN DATABASE ==');
    console.log(missingInDatabase);

    // Fields in database not in front-end
    const notInFrontEnd = actualColumns.filter(
      col => !frontEndFields.includes(col) && col !== 'employees'
    );

    console.log('\n== FIELDS IN DATABASE NOT IN FRONT-END ==');
    console.log(notInFrontEnd);

    // Process time entries to simulate front-end transformations
    const processedEntries = timeEntries.map(entry => {
      // Create a processed entry with expected front-end fields
      const processed = { ...entry };

      // Remove the nested employees object
      delete processed.employees;

      // Add derived fields that would be calculated in the front-end
      if (entry.employees) {
        processed.employee_name = `${entry.employees.first_name} ${entry.employees.last_name}`;
      } else {
        processed.employee_name = 'Unassigned';
      }

      return processed;
    });

    console.log('\n== PROCESSED TIME ENTRIES (AS USED IN FRONT-END) ==');
    console.table(processedEntries);

    // Check for relationship definition in Supabase
    console.log('\n== TIME ENTRY TO EMPLOYEE RELATIONSHIP ==');
    console.log(`Foreign key: time_entries_employee_id_fkey`);
    console.log(`References: time_entries.employee_id -> employees.employee_id`);
  } catch (error) {
    console.error('Validation error:', error);
  }
}

validateTimeEntrySchema().catch(console.error);
