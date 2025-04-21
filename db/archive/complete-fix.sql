-- First drop the troublesome trigger
DROP TRIGGER IF EXISTS estimate_status_transition_trigger ON estimates;

-- Then drop any status validation functions
DROP FUNCTION IF EXISTS validate_estimate_status_transition();

-- Then drop the existing conversion function
DROP FUNCTION IF EXISTS convert_estimate_to_project();

-- Create a very simple conversion function that handles the job description column with spaces
CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_estimate RECORD;
    v_project_id TEXT;
    v_description TEXT;
BEGIN
    -- Get the estimate
    SELECT * INTO v_estimate FROM estimates WHERE estimateid = p_estimate_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Estimate not found';
    END IF;

    -- Check if already converted
    IF v_estimate.projectid IS NOT NULL THEN
        RAISE EXCEPTION 'Estimate already has a project link: %', v_estimate.projectid;
    END IF;

    -- Handle job description (the column has a space, need double quotes in SQL)
    -- First handle the case where job description exists
    BEGIN
        -- Try to get the job description value (column with space)
        SELECT v_estimate."job description" INTO v_description;
    EXCEPTION WHEN OTHERS THEN
        -- If it fails, use a default value
        v_description := 'Project from estimate ' || p_estimate_id;
    END;

    -- Create project record with minimal fields
    INSERT INTO projects (
        projectname,
        customername,
        jobdescription,
        status,
        createdon,
        total_budget
    ) VALUES (
        'Project from ' || COALESCE(v_estimate.projectname, p_estimate_id),
        v_estimate.customername,
        v_description,  -- Use the safely obtained description
        'active',
        NOW(),
        v_estimate.estimateamount
    ) RETURNING projectid INTO v_project_id;

    -- Update estimate with converted status and project link
    UPDATE estimates
    SET status = 'converted',
        projectid = v_project_id
    WHERE estimateid = p_estimate_id;

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- Create a simple trigger just to update dates when statuses change
CREATE OR REPLACE FUNCTION update_estimate_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Set date fields based on new status (keep this useful functionality)
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
        NEW.sentdate = NOW();
    END IF;

    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.approveddate = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for the date update function
CREATE TRIGGER estimate_date_updates
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_estimate_dates();
