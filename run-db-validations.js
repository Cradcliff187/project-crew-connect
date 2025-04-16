import { executeSQL } from './src/scripts/db-validations.js';

// Run the database validation script to install the convert_estimate_to_project function
async function setupDatabaseValidations() {
  console.log('Setting up database validations...');

  try {
    // Create the estimate status enum type if it doesn't exist
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

    console.log('Database validations installed successfully!');
    console.log('You can now convert estimates to projects with:');
    console.log('supabase.rpc("convert_estimate_to_project", { p_estimate_id: "EST-319198" })');
  } catch (error) {
    console.error('Error installing database validations:', error);
  }
}

// Run the setup
setupDatabaseValidations();
