-- 007_remove_status_again.sql
-- Permanent removal of status column from change_orders & view/trigger update
-- Date: 2025-04-27

BEGIN;

-- Drop dependent trigger
DROP TRIGGER IF EXISTS trigger_update_project_summary_on_co_change ON public.change_orders;

-- Drop view
DROP VIEW IF EXISTS public.change_orders_with_items;

-- Drop column
ALTER TABLE public.change_orders DROP COLUMN IF EXISTS status;

-- Recreate view without status
CREATE VIEW public.change_orders_with_items AS
SELECT co.id,
       co.entity_type,
       co.entity_id,
       co.title,
       co.description,
       co.requested_by,
       co.requested_date,
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

-- Recreate trigger without status column dependencies
CREATE TRIGGER trigger_update_project_summary_on_co_change
AFTER INSERT OR DELETE OR UPDATE OF cost_impact, revenue_impact, total_amount
ON public.change_orders
FOR EACH ROW
EXECUTE FUNCTION update_project_co_impacts();

COMMIT;
