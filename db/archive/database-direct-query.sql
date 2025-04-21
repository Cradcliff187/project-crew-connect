-- Step 1: Check the current function definition
SELECT
    pg_get_functiondef(oid)
FROM
    pg_proc
WHERE
    proname = 'convert_estimate_to_project';

-- Step 2: Check the budget_items table structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'project_budget_items';

-- Step 3: Drop and recreate the function
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
    (SELECT customername FROM customers WHERE customerid = v_estimate.customerid),
    'Project from estimate ' || p_estimate_id,
    'Converted from estimate ' || p_estimate_id,
    'active',
    v_estimate.sitelocationaddress,
    null,
    null,
    null,
    NOW(),
    v_estimate.estimateamount
  ) RETURNING projectid INTO v_project_id;

  -- Create project_documents table if it doesn't exist
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
