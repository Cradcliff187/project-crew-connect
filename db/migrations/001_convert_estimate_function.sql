-- Migration: 001_convert_estimate_function.sql
-- Purpose: Create function to convert estimates to projects

-- First drop any existing function to ensure clean installation
DROP FUNCTION IF EXISTS convert_estimate_to_project(TEXT);

-- Create the function with latest implementation
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

  -- Ensure estimate is in approved status or transition it
  IF v_estimate.status = 'approved' THEN
    -- Good, already approved
    NULL;
  ELSIF v_estimate.status = 'sent' THEN
    -- Direct transition from sent to approved is valid
    UPDATE estimates SET
      status = 'approved',
      approveddate = NOW()
    WHERE estimateid = p_estimate_id;
  ELSIF v_estimate.status = 'draft' THEN
    -- Need two transitions: draft -> sent -> approved
    -- First transition to sent
    UPDATE estimates SET
      status = 'sent',
      sentdate = NOW()
    WHERE estimateid = p_estimate_id;

    -- Wait a moment to avoid race conditions
    PERFORM pg_sleep(0.5);

    -- Then transition to approved
    UPDATE estimates SET
      status = 'approved',
      approveddate = NOW()
    WHERE estimateid = p_estimate_id;
  ELSE
    RAISE EXCEPTION 'Estimate must be in draft, sent, or approved status to convert (current: %)', v_estimate.status;
  END IF;

  -- Refresh estimate data after status changes
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

  -- Create budget items from estimate items if revisions exist
  IF v_current_revision.id IS NOT NULL THEN
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
  END IF;

  -- Copy documents from estimate to project if documents exist
  INSERT INTO project_documents (
    project_id,
    document_id,
    title,
    description,
    document_type,
    created_at,
    updated_at
  )
  SELECT
    v_project_id,
    document_id,
    title,
    description,
    document_type,
    NOW(),
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

COMMENT ON FUNCTION convert_estimate_to_project(TEXT) IS 'Converts an estimate to a project with proper status transitions';
