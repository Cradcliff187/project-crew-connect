-- First drop the trigger
DROP TRIGGER IF EXISTS estimate_status_transition_trigger ON estimates;

-- Then drop the function completely
DROP FUNCTION IF EXISTS validate_estimate_status_transition();

-- Create a completely new simpler function that just updates dates
CREATE OR REPLACE FUNCTION update_estimate_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Set date fields based on new status
  IF NEW.status = 'sent' AND (OLD.status != 'sent' OR OLD.sentdate IS NULL) THEN
    NEW.sentdate = NOW();
  END IF;

  IF NEW.status = 'approved' AND (OLD.status != 'approved' OR OLD.approveddate IS NULL) THEN
    NEW.approveddate = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a new trigger with a different name
CREATE TRIGGER update_estimate_dates_trigger
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_estimate_dates();

-- Completely recreate the convert function
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

  -- Make the estimate approved if it's not already
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
