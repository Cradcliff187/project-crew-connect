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
