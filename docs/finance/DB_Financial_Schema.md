# Database Financial Schema

This document outlines the database schema for all financial-related tables in the application.

## Tables Overview

Based on the codebase exploration, we've identified the following financial-related tables:

### Estimates

The `estimates` table stores information about project estimates.

Key columns:

- `estimateid`: Primary key
- `customerid`: Foreign key to customers table
- `projectname`: Name of the project
- `status`: Status of the estimate (draft, sent, approved, rejected, converted)
- `estimateamount`: Total estimated amount
- `contingencyamount`: Contingency amount
- `projectid`: Foreign key to projects table (after conversion)
- `approveddate`: Date when the estimate was approved
- `sentdate`: Date when the estimate was sent

### Estimate Items

The `estimate_items` table stores line items for estimates.

Key columns:

- `id`: Primary key
- `revision_id`: Foreign key to estimate_revisions table
- `description`: Description of the item
- `item_type`: Category/type of the item
- `quantity`: Quantity
- `cost`: Unit cost
- `markup_percentage`: Markup percentage
- `markup_amount`: Markup amount
- `unit_price`: Unit price
- `total_price`: Total price (quantity \* unit_price)
- `vendor_id`: Foreign key to vendors table
- `subcontractor_id`: Foreign key to subcontractors table
- `document_id`: Foreign key to documents table

### Estimate Revisions

The `estimate_revisions` table tracks different revisions of estimates.

Key columns:

- `id`: Primary key
- `estimate_id`: Foreign key to estimates table
- `version`: Version number
- `amount`: Total amount
- `is_selected_for_view`: Flag to indicate current revision

### Projects

The `projects` table stores information about projects.

Key columns:

- `projectid`: Primary key
- `customerid`: Foreign key to customers table
- `projectname`: Name of the project
- `status`: Status of the project
- `total_budget`: Total budget amount
- `current_expenses`: Current expenses
- `contract_value`: Contract value
- `original_base_cost`: Original base cost
- `original_selling_price`: Original selling price
- `original_contingency_amount`: Original contingency amount
- `budget_status`: Status of the budget

### Project Budget Items

The `project_budget_items` table stores budget items for projects.

Key columns:

- `id`: Primary key
- `project_id`: Foreign key to projects table
- `category`: Category of the budget item
- `description`: Description of the item
- `estimated_amount`: Estimated amount
- `actual_amount`: Actual amount spent
- `estimated_cost`: Estimated cost
- `base_cost`: Base cost
- `selling_unit_price`: Selling unit price
- `markup_percentage`: Markup percentage
- `markup_amount`: Markup amount
- `selling_total_price`: Selling total price
- `gross_margin_percentage`: Gross margin percentage
- `gross_margin_amount`: Gross margin amount
- `quantity`: Quantity
- `vendor_id`: Foreign key to vendors table
- `subcontractor_id`: Foreign key to subcontractors table
- `estimate_item_origin_id`: Reference to original estimate item ID

### Change Orders

The `change_orders` table stores change orders that modify the original scope.

Key columns:

- `id`: Primary key
- `entity_id`: ID of the related entity (project or work order)
- `entity_type`: Type of entity (PROJECT or WORK_ORDER)
- `title`: Title of the change order
- `description`: Description of the change order
- `status`: Status of the change order
- `revenue_impact`: Impact on revenue
- `cost_impact`: Impact on cost
- `created_at`: Creation date
- `updated_at`: Last update date

### Change Order Items

The `change_order_items` table stores line items for change orders.

Key columns:

- `id`: Primary key
- `change_order_id`: Foreign key to change_orders table
- `description`: Description of the item
- `cost`: Cost of the item
- `price`: Price of the item
- `gross_margin`: Gross margin
- `gross_margin_percentage`: Gross margin percentage

### Work Orders

The `work_orders` table stores work orders.

Key columns:

- `id`: Primary key
- `project_id`: Foreign key to projects table
- `title`: Title of the work order
- `description`: Description of the work order
- `time_estimate`: Estimated time
- `actual_hours`: Actual hours spent
- `materials_cost`: Cost of materials
- `total_cost`: Total cost
- `expenses_cost`: Cost of expenses
- `labor_cost`: Cost of labor

### Time Entries

The `time_entries` table stores time tracking entries.

Key columns:

- `id`: Primary key
- `project_id`: Foreign key to projects table
- `work_order_id`: Foreign key to work_orders table
- `employee_id`: Foreign key to employees table
- `hours`: Hours worked
- `cost_rate`: Cost rate
- `total_cost`: Total cost
- `project_budget_item_id`: Foreign key to project_budget_items table

## Relationships

- Estimates are connected to Projects through the `projectid` field in estimates table
- Estimate Items are connected to Estimate Revisions through the `revision_id` field
- Estimate Revisions are connected to Estimates through the `estimate_id` field
- Project Budget Items are connected to Projects through the `project_id` field
- Project Budget Items can be linked to the original Estimate Item through `estimate_item_origin_id`
- Change Orders are connected to either Projects or Work Orders through `entity_id` and `entity_type`
- Change Order Items are connected to Change Orders through `change_order_id`
- Work Orders are connected to Projects through `project_id`
- Time Entries can be connected to Projects, Work Orders, and Project Budget Items

## Functions

### convert_estimate_to_project

This function converts an estimate to a project:

```sql
CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
RETURNS TEXT
```

Key operations:

1. Validates estimate status
2. Creates a new project based on estimate data
3. Creates budget items from estimate items
4. Transfers documents
5. Updates estimate with project link

## Triggers and Calculated Fields

Based on the code analysis, the following calculations are performed:

- Budget utilization: `(current_expenses / total_budget) * 100`
- Gross margin: `contract_value - total_cost`
- Gross margin percentage: `(gross_margin / contract_value) * 100`
- Cost variance: `estimated_cost - actual_cost`
