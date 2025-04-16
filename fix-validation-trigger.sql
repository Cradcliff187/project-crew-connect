-- Fix the validation trigger to match UI expectations
CREATE OR REPLACE FUNCTION validate_estimate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions
  IF (OLD.status = 'draft' AND NEW.status NOT IN ('sent')) THEN
    RAISE EXCEPTION 'Invalid status transition from draft to %', NEW.status;

  ELSIF (OLD.status = 'sent' AND NEW.status NOT IN ('approved', 'rejected')) THEN
    RAISE EXCEPTION 'Invalid status transition from sent to %', NEW.status;

  ELSIF (OLD.status = 'pending' AND NEW.status NOT IN ('approved', 'rejected')) THEN
    RAISE EXCEPTION 'Invalid status transition from pending to %', NEW.status;

  ELSIF (OLD.status = 'approved' AND NEW.status NOT IN ('converted')) THEN
    RAISE EXCEPTION 'Invalid status transition from approved to %', NEW.status;

  ELSIF (OLD.status = 'rejected' AND NEW.status NOT IN ('draft')) THEN
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

-- Then fix the convert_estimate_to_project function to respect these transitions
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
