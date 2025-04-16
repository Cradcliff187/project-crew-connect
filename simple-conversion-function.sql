-- Create a very simple conversion function that avoids using job_description
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

    -- Update to approved status if needed
    IF v_estimate.status != 'approved' THEN
        UPDATE estimates
        SET status = 'approved',
            approveddate = COALESCE(v_estimate.approveddate, NOW())
        WHERE estimateid = p_estimate_id;
    END IF;

    -- Create project record with minimal fields
    INSERT INTO projects (
        projectname,
        customername,
        status,
        createdon,
        total_budget
    ) VALUES (
        COALESCE(v_estimate.projectname, 'Project from estimate ' || p_estimate_id),
        v_estimate.customername,
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
