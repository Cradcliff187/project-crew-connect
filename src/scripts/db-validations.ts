// Script to add database validations for estimate status transitions
import { supabase } from '../integrations/supabase/client';

async function executeSQL(sql: string): Promise<void> {
  console.log(`Executing SQL:\n${sql}`);

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }

    console.log('SQL executed successfully');
  } catch (err) {
    console.error('Exception executing SQL:', err);
    throw err;
  }
}

async function createStatusValidation() {
  // First check if exec_sql function exists - this is required to run arbitrary SQL
  try {
    // First try to create the exec_sql function if it doesn't exist
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

    // Create the validation function and trigger
    await executeSQL(`
      -- Check if the enum type exists, if not create it
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status') THEN
          CREATE TYPE estimate_status AS ENUM (
            'draft', 'pending', 'sent', 'approved', 'rejected', 'converted'
          );
        END IF;
      END$$;

      -- Create transition validation function
      CREATE OR REPLACE FUNCTION validate_estimate_status_transition()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Skip validation if status hasn't changed
        IF OLD.status = NEW.status THEN
          RETURN NEW;
        END IF;

        -- Define valid transitions
        IF (OLD.status = 'draft' AND NEW.status NOT IN ('pending')) THEN
          RAISE EXCEPTION 'Invalid status transition from draft to %', NEW.status;

        ELSIF (OLD.status = 'pending' AND NEW.status NOT IN ('sent', 'approved', 'rejected')) THEN
          RAISE EXCEPTION 'Invalid status transition from pending to %', NEW.status;

        ELSIF (OLD.status = 'sent' AND NEW.status NOT IN ('approved', 'rejected')) THEN
          RAISE EXCEPTION 'Invalid status transition from sent to %', NEW.status;

        ELSIF (OLD.status = 'approved' AND NEW.status NOT IN ('converted')) THEN
          RAISE EXCEPTION 'Invalid status transition from approved to %', NEW.status;

        ELSIF (OLD.status = 'rejected' AND NEW.status NOT IN ('pending')) THEN
          RAISE EXCEPTION 'Invalid status transition from rejected to %', NEW.status;

        ELSIF (OLD.status = 'converted') THEN
          RAISE EXCEPTION 'Cannot change status of a converted estimate';
        END IF;

        -- Set date fields based on new status
        IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
          NEW.sentdate = NOW();
        END IF;

        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
          NEW.approveddate = NOW();
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger to run the function
      DROP TRIGGER IF EXISTS estimate_status_transition_trigger ON estimates;
      CREATE TRIGGER estimate_status_transition_trigger
        BEFORE UPDATE ON estimates
        FOR EACH ROW
        EXECUTE FUNCTION validate_estimate_status_transition();

      -- Rename problematic fields (remove spaces, standardize naming)
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'estimates' AND column_name = 'job description') THEN
          ALTER TABLE estimates RENAME COLUMN "job description" TO job_description;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'estimates' AND column_name = 'po#') THEN
          ALTER TABLE estimates RENAME COLUMN "po#" TO po_number;
        END IF;
      END$$;

      -- Create a function to convert estimate to project in a single transaction
      CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
      RETURNS TEXT AS $$
      DECLARE
        v_estimate RECORD;
        v_project_id TEXT;
      BEGIN
        -- Get the estimate
        SELECT * INTO v_estimate FROM estimates WHERE estimateid = p_estimate_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Estimate not found';
        END IF;

        -- Check if already converted
        IF v_estimate.projectid IS NOT NULL THEN
          RAISE EXCEPTION 'Estimate already converted to project %', v_estimate.projectid;
        END IF;

        -- If status is approved, we can convert; otherwise try to transition to approved
        IF v_estimate.status = 'approved' THEN
          -- Good, already approved
          NULL;
        ELSIF v_estimate.status = 'pending' OR v_estimate.status = 'sent' THEN
          -- Try to update to approved
          UPDATE estimates SET status = 'approved', approveddate = NOW() WHERE estimateid = p_estimate_id;
        ELSIF v_estimate.status = 'draft' THEN
          -- Need two transitions: draft -> pending -> approved
          UPDATE estimates SET status = 'pending' WHERE estimateid = p_estimate_id;
          -- Small delay to avoid potential race conditions
          PERFORM pg_sleep(0.5);
          -- Now update to approved
          UPDATE estimates SET status = 'approved', approveddate = NOW() WHERE estimateid = p_estimate_id;
        ELSE
          RAISE EXCEPTION 'Estimate must be in draft, pending, sent, or approved status to convert (current: %)', v_estimate.status;
        END IF;

        -- Refresh our copy of the estimate data after status updates
        SELECT * INTO v_estimate FROM estimates WHERE estimateid = p_estimate_id;

        -- Create project from estimate data
        INSERT INTO projects (
          customerid,
          customername,
          projectname,
          jobdescription,
          status,
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate,
          sitelocationzip,
          createdon,
          total_budget
        ) VALUES (
          v_estimate.customerid,
          v_estimate.customername,
          v_estimate.projectname,
          COALESCE(v_estimate.job_description, v_estimate.jobdescription, 'Project from estimate ' || p_estimate_id),
          'active',
          v_estimate.sitelocationaddress,
          v_estimate.sitelocationcity,
          v_estimate.sitelocationstate,
          v_estimate.sitelocationzip,
          NOW(),
          v_estimate.estimateamount
        ) RETURNING projectid INTO v_project_id;

        -- Update estimate with project link and set to converted
        UPDATE estimates
        SET status = 'converted',
            projectid = v_project_id
        WHERE estimateid = p_estimate_id;

        RETURN v_project_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

    return true;
  } catch (err) {
    console.error('Error creating validations:', err);
    return false;
  }
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
