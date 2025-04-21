-- First, drop the existing function to ensure clean install
DROP FUNCTION IF EXISTS convert_estimate_to_project;

-- Create convert_estimate_to_project function with proper structure
CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_estimate RECORD;
  v_current_revision RECORD;
  v_project_id TEXT;
  v_document RECORD;
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
    COALESCE(v_estimate.projectname, 'Project from estimate ' || p_estimate_id),
    COALESCE(v_estimate."job description", v_estimate.jobdescription, 'Converted from estimate ' || p_estimate_id),
    'active',
    v_estimate.sitelocationaddress,
    null,
    null,
    null,
    NOW(),
    v_estimate.estimateamount
  ) RETURNING projectid INTO v_project_id;

  -- Create budget items from current revision with correct column mapping
  INSERT INTO project_budget_items (
    project_id,
    category,
    description,
    estimated_amount,
    created_at,
    updated_at
  )
  SELECT
    v_project_id,
    item_type,
    description,
    total_price,
    NOW(),
    NOW()
  FROM estimate_items
  WHERE revision_id = v_current_revision.id;

  -- Transfer documents - copying from documents table where entity_type is ESTIMATE
  -- This aligns with how the application actually handles documents
  FOR v_document IN
    SELECT * FROM documents WHERE entity_type = 'ESTIMATE' AND entity_id = p_estimate_id
  LOOP
    -- Create a project document based on estimate document
    INSERT INTO documents (
      document_id,
      entity_type,
      entity_id,
      storage_path,
      file_name,
      file_type,
      file_size,
      category,
      notes,
      created_at,
      updated_at
    ) VALUES (
      v_document.document_id, -- Reuse same document_id to maintain connection
      'PROJECT',               -- Change entity type to PROJECT
      v_project_id,            -- Link to new project
      v_document.storage_path, -- Keep same file path
      v_document.file_name,
      v_document.file_type,
      v_document.file_size,
      v_document.category,
      v_document.notes || ' (Copied from Estimate ' || p_estimate_id || ')',
      NOW(),
      NOW()
    );
  END LOOP;

  -- Update estimate with project link and set to converted
  UPDATE estimates
  SET status = 'converted',
      projectid = v_project_id
  WHERE estimateid = p_estimate_id;

  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;
