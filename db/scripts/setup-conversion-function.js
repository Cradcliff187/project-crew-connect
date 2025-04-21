import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEstimateToProjectConversion() {
  console.log('Setting up estimate-to-project conversion...');

  try {
    // 1. Create project_documents table
    console.log('\n1. Creating project_documents table if it does not exist...');

    // First try directly creating the table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS project_documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id TEXT REFERENCES projects(projectid),
          document_id TEXT,
          title TEXT,
          description TEXT,
          document_type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    });

    if (createTableError) {
      console.error('Error creating project_documents table:', createTableError.message);

      // If exec_sql RPC doesn't exist, we need to notify the user
      if (createTableError.message.includes('function "exec_sql" does not exist')) {
        console.log(
          'The exec_sql function does not exist. You will need to create this table manually in the Supabase dashboard SQL editor.'
        );
        console.log('Run this SQL in the Supabase dashboard:');
        console.log(`
          CREATE TABLE IF NOT EXISTS project_documents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id TEXT REFERENCES projects(projectid),
            document_id TEXT,
            title TEXT,
            description TEXT,
            document_type TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
    } else {
      console.log('✅ project_documents table created successfully');
    }

    // 2. Create convert_estimate_to_project function
    console.log('\n2. Creating convert_estimate_to_project function...');

    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
        RETURNS TEXT AS $$
        DECLARE
          v_estimate RECORD;
          v_current_revision RECORD;
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

          -- Get the current revision
          SELECT er.* INTO v_current_revision
          FROM estimate_revisions er
          WHERE er.estimate_id = p_estimate_id AND er.is_current = true;

          -- Create project
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

          -- Create budget items from current revision
          INSERT INTO project_budget_items (
            project_id,
            description,
            quantity,
            unit_price,
            total_price,
            cost,
            markup_percentage,
            markup_amount,
            item_type,
            vendor_id,
            document_id,
            notes,
            created_at,
            original_estimate_item_id
          )
          SELECT
            v_project_id,
            description,
            quantity,
            unit_price,
            total_price,
            cost,
            markup_percentage,
            markup_amount,
            item_type,
            vendor_id,
            document_id,
            notes,
            NOW(),
            id
          FROM estimate_items
          WHERE revision_id = v_current_revision.id;

          -- Link documents if estimate_documents table has data
          INSERT INTO project_documents (
            project_id,
            document_id,
            title,
            description,
            document_type,
            created_at
          )
          SELECT
            v_project_id,
            document_id,
            title,
            description,
            document_type,
            NOW()
          FROM estimate_documents
          WHERE estimate_id = p_estimate_id;

          -- Update estimate with project link and set to converted
          UPDATE estimates
          SET status = 'converted',
              projectid = v_project_id
          WHERE estimateid = p_estimate_id;

          RETURN v_project_id;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    if (createFunctionError) {
      console.error('Error creating function:', createFunctionError.message);

      if (createFunctionError.message.includes('function "exec_sql" does not exist')) {
        console.log(
          'The exec_sql function does not exist. You will need to create this function manually in the Supabase dashboard SQL editor.'
        );
        console.log(
          'Run this SQL in the Supabase dashboard - see database-setup.sql file for the function code'
        );
      }
    } else {
      console.log('✅ convert_estimate_to_project function created successfully');
    }

    // Test that the function exists now
    console.log('\n3. Testing if the function exists...');
    try {
      const { data, error } = await supabase.rpc('convert_estimate_to_project', {
        p_estimate_id: 'TEST-ID',
      });

      if (error && !error.message.includes('Estimate not found')) {
        console.log('❌ Function test failed:', error.message);
      } else {
        console.log(
          '✅ Function exists and works correctly (returned expected "Estimate not found" error)'
        );
      }
    } catch (err) {
      console.log('❌ Error testing function:', err.message);
    }
  } catch (error) {
    console.error('Error setting up conversion:', error);
  }
}

setupEstimateToProjectConversion();
