-- 003_remove_change_order_status_history.sql
-- Financial Tracking Audit – Schema Cleanup
-- Date: 2025-04-27

BEGIN;

-- Drop status history table if it exists
DROP TABLE IF EXISTS public.change_order_status_history CASCADE;

-- Remove `status` column from change_orders (align with plan v0.12)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM   information_schema.columns
        WHERE  table_schema = 'public'
        AND    table_name   = 'change_orders'
        AND    column_name  = 'status'
    ) THEN
        ALTER TABLE public.change_orders
            DROP COLUMN status;
    END IF;
END $$;

COMMIT;
