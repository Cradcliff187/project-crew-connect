-- 006_readd_status_column.sql
-- Temporary stop-gap: Re-add status column to keep front-end until refactor
-- Date: 2025-04-27

BEGIN;

-- Add status column if missing
ALTER TABLE public.change_orders
ADD COLUMN IF NOT EXISTS status text DEFAULT 'DRAFT';

-- Update existing rows to DRAFT where null
UPDATE public.change_orders SET status = 'DRAFT' WHERE status IS NULL;

-- Replace view to include status again
DROP VIEW IF EXISTS public.change_orders_with_items;
CREATE VIEW public.change_orders_with_items AS
SELECT co.id,
       co.entity_type,
       co.entity_id,
       co.title,
       co.description,
       co.requested_by,
       co.requested_date,
       co.status,
       co.approved_by,
       co.approved_date,
       co.approval_notes,
       co.total_amount,
       co.cost_impact,
       co.revenue_impact,
       co.impact_days,
       co.original_completion_date,
       co.new_completion_date,
       co.change_order_number,
       co.document_id,
       co.created_at,
       co.updated_at,
       json_agg(ci.* ORDER BY ci.created_at) FILTER (WHERE ci.id IS NOT NULL) AS items
FROM   public.change_orders co
LEFT   JOIN public.change_order_items ci ON ci.change_order_id = co.id
GROUP  BY co.id;

COMMIT;
