-- Drop the trigger that's enforcing status transitions
DROP TRIGGER IF EXISTS estimate_status_transition_trigger ON estimates;

-- Keep the function but make it a no-op that just passes through any changes
CREATE OR REPLACE FUNCTION validate_estimate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Set date fields based on new status (keep this useful functionality)
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    NEW.sentdate = NOW();
  END IF;

  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approveddate = NOW();
  END IF;

  -- Just pass through all changes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the convert_estimate_to_project function to be simpler too
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

  -- If status is not approved, make it approved
  IF v_estimate.status != 'approved' THEN
    UPDATE estimates SET
      status = 'approved',
      approveddate = NOW()
    WHERE estimateid = p_estimate_id;
  END IF;

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
