-- Add subname as a generated column alias for company_name
-- This fixes the mismatch between frontend expectations and database schema
ALTER TABLE subcontractors
ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;

-- Create index on the generated column for better query performance
CREATE INDEX IF NOT EXISTS idx_subcontractors_subname ON subcontractors (subname);

-- Add comment explaining the column
COMMENT ON COLUMN subcontractors.subname IS 'Generated alias for company_name to maintain backward compatibility with frontend code';
