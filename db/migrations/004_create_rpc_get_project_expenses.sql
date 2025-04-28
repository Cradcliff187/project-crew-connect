-- 004_create_rpc_get_project_expenses.sql
-- Financial Tracking Audit – Create helper RPC for project expenses
-- Date: 2025-04-27

BEGIN;

-- Drop existing function if redeploying
DROP FUNCTION IF EXISTS public.rpc_get_project_expenses(p_project_id uuid);

CREATE OR REPLACE FUNCTION public.rpc_get_project_expenses(p_project_id uuid)
RETURNS TABLE (
    id uuid,
    entity_id uuid,
    budget_item_id uuid,
    expense_date date,
    amount numeric,
    vendor_id uuid,
    description text,
    document_id uuid,
    created_at timestamp with time zone,
    budget_item_category text,
    vendor_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id,
           e.entity_id,
           e.budget_item_id,
           e.expense_date,
           e.amount,
           e.vendor_id,
           e.description,
           e.document_id,
           e.created_at,
           bi.category AS budget_item_category,
           v.vendorname AS vendor_name
    FROM   public.expenses e
    LEFT   JOIN public.project_budget_items bi ON bi.id = e.budget_item_id
    LEFT   JOIN public.vendors v ON v.vendorid = e.vendor_id
    WHERE  e.entity_type = 'PROJECT'
      AND  e.entity_id   = p_project_id
    ORDER  BY e.expense_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.rpc_get_project_expenses IS 'Returns all expenses for a given project, enriched with budget item category and vendor name.';

COMMIT;
