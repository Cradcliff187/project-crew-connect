-- First drop all triggers on the estimates table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN (
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'estimates'::regclass
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON estimates';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Drop any function that mentions estimate_status
DO $$
DECLARE
    function_record RECORD;
BEGIN
    FOR function_record IN (
        SELECT proname, proargtypes
        FROM pg_proc
        WHERE proname LIKE '%estimate%status%' OR proname LIKE '%validate%'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || function_record.proname || '() CASCADE';
        RAISE NOTICE 'Dropped function: %', function_record.proname;
    END LOOP;
END $$;

-- Check if estimate_status exists as a type and drop it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status') THEN
        EXECUTE 'DROP TYPE estimate_status CASCADE';
        RAISE NOTICE 'Dropped estimate_status type';
    END IF;
END $$;

-- Create a new minimal function for date updates only
CREATE OR REPLACE FUNCTION update_estimate_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update date fields, with no restrictions on status
    IF NEW.status = 'sent' AND (OLD.status != 'sent' OR OLD.sentdate IS NULL) THEN
        NEW.sentdate = NOW();
    END IF;

    IF NEW.status = 'approved' AND (OLD.status != 'approved' OR OLD.approveddate IS NULL) THEN
        NEW.approveddate = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a minimal trigger just for date updates
CREATE TRIGGER estimate_date_updates
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_estimate_dates();

-- Create a simplified conversion function
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

    -- Create project record
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
        COALESCE(v_estimate.job_description, v_estimate.jobdescription, 'Project from ' || p_estimate_id),
        'active',
        v_estimate.sitelocationaddress,
        v_estimate.sitelocationcity,
        v_estimate.sitelocationstate,
        v_estimate.sitelocationzip,
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

-- Verify no status validation exists
DO $$
BEGIN
    RAISE NOTICE 'All estimate status validation removed. Status changes should now work without restrictions.';
END $$;
