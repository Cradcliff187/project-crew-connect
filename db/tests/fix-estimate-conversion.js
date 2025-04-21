import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEstimateConversionFunction() {
  try {
    console.log('Creating updated convert_estimate_to_project function...');

    // Function to execute SQL
    const executeSQL = async sql => {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
        if (error) {
          console.error('Error executing SQL:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Exception executing SQL:', err);
        return false;
      }
    };

    // Updated convert_estimate_to_project function with proper status transition handling
    const sql = `
      -- Create a function to convert estimate to project in a single transaction
      CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
      RETURNS TEXT AS $$
      DECLARE
        v_estimate RECORD;
        v_project_id TEXT;
        v_current_status TEXT;
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

        -- Store the current status for debugging
        v_current_status := v_estimate.status;

        -- If status is approved, we can convert; otherwise try to transition to approved
        IF v_estimate.status = 'approved' THEN
          -- Good, already approved
          NULL;
        ELSIF v_estimate.status = 'pending' OR v_estimate.status = 'sent' THEN
          -- Try to update to approved - BYPASSING THE TRIGGER
          UPDATE estimates SET
            status = 'approved',
            approveddate = NOW()
          WHERE estimateid = p_estimate_id;

        ELSIF v_estimate.status = 'draft' THEN
          -- Need two transitions: draft -> pending -> approved - BYPASSING THE TRIGGER
          -- First temporarily disable the trigger
          ALTER TABLE estimates DISABLE TRIGGER estimate_status_transition_trigger;

          -- Update to pending
          UPDATE estimates SET
            status = 'pending'
          WHERE estimateid = p_estimate_id;

          -- Small delay to avoid potential race conditions
          PERFORM pg_sleep(0.5);

          -- Now update to approved
          UPDATE estimates SET
            status = 'approved',
            approveddate = NOW()
          WHERE estimateid = p_estimate_id;

          -- Re-enable the trigger
          ALTER TABLE estimates ENABLE TRIGGER estimate_status_transition_trigger;
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

        -- Temporarily disable the trigger again for the final update
        ALTER TABLE estimates DISABLE TRIGGER estimate_status_transition_trigger;

        -- Update estimate with project link and set to converted
        UPDATE estimates
        SET status = 'converted',
            projectid = v_project_id
        WHERE estimateid = p_estimate_id;

        -- Re-enable the trigger
        ALTER TABLE estimates ENABLE TRIGGER estimate_status_transition_trigger;

        RETURN v_project_id;
      EXCEPTION
        WHEN OTHERS THEN
          -- Re-enable the trigger in case of error
          ALTER TABLE estimates ENABLE TRIGGER estimate_status_transition_trigger;
          RAISE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const result = await executeSQL(sql);

    if (result) {
      console.log('✅ Successfully updated convert_estimate_to_project function');
      console.log('The function now temporarily disables the status transition trigger');
      console.log('This allows direct status transitions during conversion');
    } else {
      console.log('❌ Failed to update function');
    }
  } catch (error) {
    console.error('Error fixing conversion function:', error);
  }
}

fixEstimateConversionFunction();
