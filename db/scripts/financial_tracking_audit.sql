-- Financial Tracking Audit – Time Entries & Change Orders
-- Generated: 2025-04-27
-- Purpose: Identify orphan or mismatched records ahead of automated fixes.
-- NOTE: Run as service-role or database admin. No data is modified in this script.

/* -------------------------------------------------------------------------
   1. TIME ENTRIES WITHOUT MATCHING EXPENSES
   --------------------------------------------------------------------- */
SELECT te.id            AS time_entry_id,
       te.entity_type,
       te.entity_id,
       te.date_worked,
       te.hours_worked,
       te.total_cost,
       te.employee_id
FROM   public.time_entries te
LEFT   JOIN public.expenses e ON e.time_entry_id = te.id
WHERE  e.id IS NULL;

/* -------------------------------------------------------------------------
   2. EXPENSES WITH expense_type = 'LABOR' BUT NO LINKED TIME ENTRY
   --------------------------------------------------------------------- */
SELECT e.id           AS expense_id,
       e.entity_type,
       e.entity_id,
       e.amount,
       e.expense_date,
       e.created_at
FROM   public.expenses e
WHERE  e.expense_type = 'LABOR'
  AND  e.time_entry_id IS NULL;

/* -------------------------------------------------------------------------
   3. CHANGE ORDERS WITHOUT BUDGET DELTAS (cost_impact = 0 AND revenue_impact = 0)
   --------------------------------------------------------------------- */
SELECT co.id               AS change_order_id,
       co.title,
       co.entity_type,
       co.entity_id,
       co.total_amount,
       co.cost_impact,
       co.revenue_impact,
       co.created_at
FROM   public.change_orders co
WHERE  COALESCE(co.cost_impact, 0) = 0
  AND  COALESCE(co.revenue_impact, 0) = 0;

/* -------------------------------------------------------------------------
   4. EXPENSES NOT TIED TO ANY PARENT ENTITY (project, work order, etc.)
   --------------------------------------------------------------------- */
SELECT e.id           AS expense_id,
       e.entity_type,
       e.entity_id,
       e.expense_type,
       e.amount,
       e.created_at
FROM   public.expenses e
WHERE  e.entity_id IS NULL
   OR  e.entity_type IS NULL;

/* -------------------------------------------------------------------------
   5. PROJECT ACTUAL COST RECONCILIATION
      Calculates diff between stored project.current_expenses and
      a fresh aggregation from expenses table.
   --------------------------------------------------------------------- */
WITH calculated AS (
    SELECT p.projectid,
           SUM(e.amount) AS calc_current_expenses
    FROM   public.projects p
    LEFT   JOIN public.expenses e
           ON e.entity_type = 'PROJECT'
          AND e.entity_id   = p.projectid
    GROUP  BY p.projectid
)
SELECT p.projectid,
       p.current_expenses   AS stored_current_expenses,
       c.calc_current_expenses,
       (c.calc_current_expenses - p.current_expenses) AS diff
FROM   public.projects p
JOIN   calculated c USING (projectid)
WHERE  COALESCE(c.calc_current_expenses, 0) <> COALESCE(p.current_expenses, 0);

-- End of audit queries
