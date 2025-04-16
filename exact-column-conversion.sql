-- Create an extremely simplified conversion function with exact column names
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
        RAISE EXCEPTION 'Estimate already has a project link: %', v_estimate.projectid;
    END IF;

    -- Create project record with only required fields
    -- Note: column names with spaces or special chars must be double-quoted
    INSERT INTO projects (
        projectname,
        customername,
        jobdescription,  -- This column in projects doesn't have a space
        status,
        createdon
    ) VALUES (
        COALESCE(v_estimate.projectname, 'Project from estimate ' || p_estimate_id),
        v_estimate.customername,
        v_estimate."job description",  -- Double-quoted column with space
        'active',
        NOW()
    ) RETURNING projectid INTO v_project_id;

    -- Update estimate with converted status and project link
    UPDATE estimates
    SET status = 'converted',
        projectid = v_project_id
    WHERE estimateid = p_estimate_id;

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;
