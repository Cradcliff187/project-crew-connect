-- Direct SQL script to fix estimate conversion for EST-364978
-- Run this in your Supabase SQL Editor (https://app.supabase.com/)

-- Start a transaction
BEGIN;

-- Step 1: Check current estimate status
SELECT estimateid, status, projectid, projectname, customerid, customername, "job description"
FROM estimates
WHERE estimateid = 'EST-364978';

-- Step 2: Update estimate to pending status (if in draft)
UPDATE estimates
SET status = 'pending',
    updated_at = NOW()
WHERE estimateid = 'EST-364978'
  AND status = 'draft';

-- Step 3: Update estimate to approved status
UPDATE estimates
SET status = 'approved',
    approveddate = NOW(),
    updated_at = NOW()
WHERE estimateid = 'EST-364978'
  AND status IN ('pending', 'sent');

-- Step 4: Create new project from estimate
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
)
SELECT
  customerid,
  customername,
  projectname,
  "job description",
  'active',
  sitelocationaddress,
  sitelocationcity,
  sitelocationstate,
  sitelocationzip,
  NOW(),
  estimateamount
FROM estimates
WHERE estimateid = 'EST-364978'
RETURNING projectid;

-- Step 5: Link estimate to the newly created project
UPDATE estimates
SET status = 'converted',
    projectid = (
      SELECT projectid
      FROM projects
      WHERE projectname = (
        SELECT projectname
        FROM estimates
        WHERE estimateid = 'EST-364978'
      )
      ORDER BY createdon DESC
      LIMIT 1
    ),
    updated_at = NOW()
WHERE estimateid = 'EST-364978';

-- Step 6: Verify the changes
SELECT estimateid, status, projectid
FROM estimates
WHERE estimateid = 'EST-364978';

-- If everything looks good, commit the transaction
COMMIT;

-- If there are issues, you can roll back with: ROLLBACK;
