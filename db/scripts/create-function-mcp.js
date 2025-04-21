import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateResources() {
  try {
    // First check if the project_documents table exists
    console.log('Checking if project_documents table exists...');

    // Check if table exists by trying to select from it
    const { data: docsTest, error: docsError } = await supabase
      .from('project_documents')
      .select('id')
      .limit(1);

    if (docsError && docsError.message.includes('does not exist')) {
      console.log('project_documents table does not exist, will create it');

      // We can't directly create tables through the client API
      // We would need RLS permissions or a server-side function
      console.log('To create the project_documents table, run this SQL in Supabase:');
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
);`);
    } else {
      console.log('project_documents table already exists!');
    }

    // Now check if the function exists
    console.log('\nChecking if convert_estimate_to_project function exists...');

    // Try to call the function with a non-existent ID to check if it exists
    const { data: funcResult, error: funcError } = await supabase.rpc(
      'convert_estimate_to_project',
      {
        p_estimate_id: 'non-existent-id',
      }
    );

    if (funcError && funcError.message.includes('does not exist')) {
      console.log('convert_estimate_to_project function does not exist, will need to create it');
      console.log('To create the function, run this SQL in Supabase:');
      console.log(`
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
$$ LANGUAGE plpgsql;`);
    } else if (funcError && funcError.message.includes('Estimate not found')) {
      console.log('convert_estimate_to_project function already exists!');
    } else {
      console.log('Unexpected result when checking function:', funcError || funcResult);
    }
  } catch (error) {
    console.error('Error checking resources:', error);
  }
}

// Run the check
checkAndCreateResources();
