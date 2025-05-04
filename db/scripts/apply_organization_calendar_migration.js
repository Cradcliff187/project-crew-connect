const path = require('path');
const {
  applyMigrationFromFile,
  createSupabaseClient,
  verifyTableExists,
} = require('./migration-utils');

// Configuration
const MIGRATION_FILE = path.resolve(__dirname, '../migrations/add_organization_calendar.sql');

async function main() {
  try {
    console.log('Starting organization calendar migration...');

    // Apply the migration
    const migrationResult = await applyMigrationFromFile(MIGRATION_FILE);

    if (!migrationResult.success) {
      console.error('Failed to apply migration');
      process.exit(1);
    }

    // Initialize supabase client for verification
    const supabase = createSupabaseClient();

    // Verify the changes by querying the column information for project_milestones
    const { data, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'project_milestones')
      .order('ordinal_position');

    if (schemaError) {
      console.error('Error checking schema:', schemaError);
    } else {
      console.log('Current project_milestones table schema:');
      console.log(JSON.stringify(data, null, 2));
    }

    // Verify the organization_calendar table was created
    const tableExists = await verifyTableExists(supabase, 'organization_calendar');

    if (tableExists) {
      console.log('organization_calendar table created successfully');
    } else {
      console.error('organization_calendar table was not created!');
    }

    // Verify the calendar_access table was created
    const accessTableExists = await verifyTableExists(supabase, 'calendar_access');

    if (accessTableExists) {
      console.log('calendar_access table created successfully');
    } else {
      console.error('calendar_access table was not created!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
