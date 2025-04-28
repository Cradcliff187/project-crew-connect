# Financial-Tracking Audit – Checkpoint A

> **Date:** 2025-04-27
> **Author:** AI Agent (Cursor MCP)

## Overview

This document provides a high-level map of all database assets, API calls and front-end pathways that participate in **Time Tracking** and **Change Order** financial flows. It is produced as part of _Checkpoint A_ of the Financial-Tracking Audit initiative.

---

## 1 Database Tables & Views

| Domain        | Table / View                                    | Purpose                                                                                                                                 |
| ------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Time Tracking | `time_entries`                                  | Raw labour entries; one row per employee per work session. Includes cost & bill rates plus computed totals.                             |
|               | `time_entry_document_links`                     | Join table between `time_entries` and file uploads (receipts, photos).                                                                  |
|               | `expenses`                                      | Labour expenses are auto-inserted here (trigger `create_expense_from_time_entry`) with `expense_type = 'LABOR'` and FK `time_entry_id`. |
|               | `unified_work_order_expenses` (view)            | Combines `expenses`, `documents`, and `change_order_items` for Work-Order expense dashboards.                                           |
| Employees     | `employees`                                     | Stores `cost_rate`/`bill_rate` defaults consumed by `time_entries` trigger logic.                                                       |
| Settings      | `settings`                                      | Holds global defaults like `default_labor_cost_rate` etc. Consumed by PL/pgSQL helper functions.                                        |
| Change Orders | `change_orders`                                 | Master record for each CO. Financial fields `cost_impact`, `revenue_impact`, `total_amount`.                                            |
|               | `change_order_items`                            | Line-items that roll up into a CO; used to derive total amounts.                                                                        |
|               | `change_order_status_history`                   | Status audit trail (marked **to be removed** per plan v0.12).                                                                           |
|               | `change_orders_with_items` (view)               | JSON-aggregated view used in front-end dashboards.                                                                                      |
| Budgets       | `project_budget_items`                          | Budget line items. Updated by function `update_budget_item_actuals` and CO triggers.                                                    |
|               | `project_budgets` (**TODO: confirm existence**) | Per-project summary (referenced in financial roll-up).                                                                                  |
| Projects      | `projects`                                      | Holds `current_expenses`, `current_cost`, etc., updated via `update_project_current_expenses`.                                          |

### Key Triggers / Functions

| Name                              | Type       | Description                                                                             |
| --------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `calculate_time_entry_total_cost` | Trigger FN | Computes `total_cost`/`total_billable` before insert/update on `time_entries`.          |
| `create_expense_from_time_entry`  | Trigger    | Inserts linked row into `expenses` on `time_entries` insert/update.                     |
| `validate_labor_expense`          | Trigger    | Enforces `require_time_entry_for_labor_expense` setting.                                |
| `increment_project_co_impact`     | SQL FN     | Adds CO deltas to project budget & margin columns. Called by CO triggers.               |
| `update_project_current_expenses` | RPC/SQL FN | Recalculates `projects.current_expenses` from `expenses`.                               |
| `update_budget_item_actuals`      | SQL FN     | Updates `actual_amount` on `project_budget_items` whenever an expense or CO item posts. |

---

## 2 Front-End Data Flows

### 2.1 Time Entry ➜ Expense ➜ Budget

```
TimeEntryFormWizard / MobileQuickLogSheet / TimelogAddSheet
    └── supabase.from('time_entries').insert()
          └── DB trigger calculate_time_entry_total_cost
          └── DB trigger create_expense_from_time_entry
                 └── INSERT INTO expenses … (expense_type='LABOR')
                       └── Trigger update_budget_item_actuals (if budget_item_id IS NOT NULL)
                       └── Function update_project_current_expenses(project_id)
```

UI surfaces affected:

- ProjectTimelogsList (projects)
- Project Expenses Panel (`/src/components/projects/budget/...`)
- WorkOrder Timelog Lists & Expense tables (`unified_work_order_expenses` view)

### 2.2 Change Order ➜ Budget Adjustment ➜ Project Dashboard

```
ChangeOrderDialog (create / edit)
    └── supabase.from('change_orders').insert()/update()
          └── PL/pgSQL BEFORE INSERT trigger
                • generate_change_order_number
                • increment_project_co_impact(p_project_id, cost_inc, revenue_inc)
                      └── Updates project_budgets & projects rows
```

UI surfaces affected:

- ChangeOrdersList & ImpactDashboard (projects/detail/ChangeOrders)
- Budget Impact Analysis widget
- Project Financial Summary cards

---

## 3 API / RPC Endpoints Consumed by Front-End

| Hook / File                                          | Supabase Call                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `useTimeEntries` (src/components/timeTracking/hooks) | `from('time_entries').select()`                                                                           |
| `useTimeEntrySubmit`                                 | `from('time_entries').insert()`                                                                           |
| `useProjectTimelogs`                                 | `from('time_entries').select().eq('entity_type','PROJECT')`                                               |
| `ChangeOrdersList`                                   | `from('change_orders').select('*, items:change_order_items(*)')`                                          |
| `ChangeOrderDialog`                                  | INSERT/UPDATE on `change_orders` + batch `change_order_items`                                             |
| **Planned**: `rpc_get_project_expenses`              | Not yet implemented – should replace raw `expenses` selects in `/apps/web/src/features/expenses/hooks.ts` |

---

## 4 Identified Gaps (Pre-Audit)

1. **Missing RPC for project expenses** – direct table queries bypass roll-up logic.
2. **No switch cases for `TIME` / `CHANGE_ORDER` in `supabase/functions/webhooks/expense_update.ts`** (file absent → need creation).
3. **Status history table still present** despite plan decision to remove.

These gaps will be addressed in subsequent phases of the audit.

---

**End of Checkpoint A**
