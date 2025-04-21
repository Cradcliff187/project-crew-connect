// Script to add database validations for estimate status transitions
import { supabase } from '../integrations/supabase/client';
import fs from 'fs';
import path from 'path';

async function executeSQL(sql: string): Promise<boolean> {
  console.log(`Executing SQL of length: ${sql.length} characters`);

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }

    console.log('SQL executed successfully');
    return true;
  } catch (err) {
    console.error('Exception executing SQL:', err);
    return false;
  }
}

async function createStatusValidation(): Promise<boolean> {
  try {
    // First check if exec_sql function exists - this is required to run arbitrary SQL
    try {
      await supabase
        .rpc('exec_sql', {
          sql_string: 'SELECT 1',
        })
        .catch(async () => {
          // If exec_sql doesn't exist, we'll create it directly
          console.log('Creating exec_sql function...');
          const { error } = await supabase.from('_exec_sql').select('*').limit(1);
          if (error) {
            console.log(
              'Could not create exec_sql function directly. Please run this SQL in the Supabase SQL editor:'
            );
            console.log(`
            -- Create a function to execute arbitrary SQL (admin only)
            CREATE OR REPLACE FUNCTION exec_sql(sql_string text) RETURNS void AS $$
            BEGIN
              EXECUTE sql_string;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `);
            return false;
          }
        });
    } catch (err) {
      console.error('Error checking exec_sql function:', err);
      return false;
    }

    // Load the migration file from the db/migrations directory
    const migrationPath = path.join(
      process.cwd(),
      'db',
      'migrations',
      '001_convert_estimate_function.sql'
    );

    try {
      // Check if the migration file exists
      if (!fs.existsSync(migrationPath)) {
        console.error(`Migration file not found: ${migrationPath}`);
        return false;
      }

      // Read the migration file content
      const sqlContent = fs.readFileSync(migrationPath, 'utf8');

      // Execute the migration
      const success = await executeSQL(sqlContent);

      if (success) {
        console.log('Migration successful!');

        // Verify that the function exists
        try {
          const { data, error } = await supabase.rpc('convert_estimate_to_project', {
            p_estimate_id: 'TEST-ID-NOT-FOUND',
          });

          // We expect an error because the test ID doesn't exist,
          // but the error should be about the estimate not being found,
          // not about the function not existing.
          if (error && error.message.includes('Estimate not found')) {
            console.log('Function exists and is working correctly!');
            return true;
          } else if (error && error.message.includes('function')) {
            console.error('Function was not created properly:', error);
            return false;
          }
        } catch (verifyErr) {
          console.error('Error verifying function:', verifyErr);
          return false;
        }
      }

      return success;
    } catch (fileErr) {
      console.error('Error reading migration file:', fileErr);
      return false;
    }
  } catch (err) {
    console.error('Error creating validations:', err);
    return false;
  }

  return false;
}

// Execute the function
createStatusValidation()
  .then(success => {
    if (success) {
      console.log('Database validations created successfully!');
      console.log('You can now convert estimates to projects with a single call:');
      console.log('supabase.rpc("convert_estimate_to_project", { p_estimate_id: "EST-364978" })');
    } else {
      console.log('Failed to create all validations.');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });

export {};
