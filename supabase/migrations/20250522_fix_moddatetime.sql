-- Migration to fix the moddatetime() trigger function
-- This addresses issues with schedule_items table and improves how the function checks for updated_at column

-- Fix the moddatetime() function to properly check for the existence of updated_at column
CREATE OR REPLACE FUNCTION moddatetime()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  has_updated_at boolean;
BEGIN
  -- Check if the table has an updated_at column using information_schema
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = TG_TABLE_NAME::text
    AND column_name = 'updated_at'
  ) INTO has_updated_at;

  -- Only apply the timestamp update if column exists
  IF has_updated_at THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update any comment on the function to document the fix
COMMENT ON FUNCTION moddatetime() IS 'Trigger to update the updated_at column - safely checks if the column exists first';

-- Log entry for audit purposes (can be checked in pg_stat_activity)
DO $$
BEGIN
  RAISE NOTICE 'Applied fix for moddatetime() function to properly handle tables without updated_at column';
END $$;
