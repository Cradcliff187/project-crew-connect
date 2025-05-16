# Finance User Journeys

This document outlines the key financial user journeys within the application, including the UI paths, database operations, and calculations involved.

## 1. Create and Send Estimate

### UI Path Sequence

1. Navigate to Estimates section
2. Click "Create New Estimate"
3. Select customer
4. Add estimate line items
   - Specify quantities, costs, markup percentages
   - Financial calculations update in real-time
5. Review financial summary (costs, markup, gross margin)
6. Add contingency (optional)
7. Save estimate as draft
8. Review and send to customer

### Supabase Operations

- INSERT into `estimates` table
- INSERT into `estimate_revisions` table
- INSERT into `estimate_items` table for each line item
- UPDATE `estimates` table to change status from "draft" to "sent"

### Calculations

- Item Total Price: `quantity * unit_price`
- Subtotal: Sum of all item total prices
- Total Cost: Sum of all item costs (`quantity * cost`)
- Total Markup: Sum of all item markups
- Gross Margin: `subtotal - totalCost`
- Gross Margin Percentage: `(grossMargin / subtotal) * 100`
- Total with Contingency: `subtotal + contingencyAmount`

## 2. Convert Estimate to Project

### UI Path Sequence

1. Navigate to Estimate details page
2. View approved estimate
3. Click "Convert to Project" button
4. Confirm conversion
5. System redirects to new Project page

### Supabase Operations

- Call `convert_estimate_to_project` function with estimate ID
- Function creates new project
- Function creates budget items from estimate items
- Function transfers documents
- Function updates estimate status to "converted"

### Calculations

- Project budget is initialized with estimate amount
- Budget items inherit financial values from estimate items

## 3. Manage Project Budget

### UI Path Sequence

1. Navigate to Project details page
2. Select "Budget" tab
3. View budget overview (total budget, expenses, variance)
4. View budget items table
5. Add, edit, or delete budget items
6. Update total project budget (if needed)

### Supabase Operations

- SELECT from `projects` table to get budget info
- SELECT from `project_budget_items` table to get items
- INSERT/UPDATE/DELETE operations on `project_budget_items` table
- UPDATE `projects` table to update total budget

### Calculations

- Total Estimated Revenue: Sum of all budget item estimated amounts
- Total Estimated Cost: Sum of all budget item estimated costs
- Total Actual Cost: Sum of all budget item actual amounts
- Estimated Gross Margin: `totalEstimatedRevenue - totalEstimatedCost`
- Actual Gross Margin: `totalEstimatedRevenue - totalActualCost`
- Cost Variance: `totalEstimatedCost - totalActualCost`
- Overall Project Variance: `totalBudget - totalActualCost`
- Budget Utilization: `(current_expenses / total_budget) * 100`

## 4. Create Change Order

### UI Path Sequence

1. Navigate to Project details page
2. Select "Change Orders" tab
3. Click "Create Change Order"
4. Enter change order details and items
5. Calculate revenue and cost impacts
6. Set change order status
7. Save change order

### Supabase Operations

- INSERT into `change_orders` table
- INSERT into `change_order_items` table for each line item
- Potentially UPDATE `projects` table to adjust contract value and budget

### Calculations

- Change Order Item Total: `quantity * price`
- Total Revenue Impact: Sum of all item prices
- Total Cost Impact: Sum of all item costs
- Gross Margin: `price - cost`
- Gross Margin Percentage: `(gross_margin / price) * 100`

## 5. Financial Summary View

### UI Path Sequence

1. Navigate to Project details page
2. Select "Financial Summary" tab
3. View revenue breakdown
4. View budget summary
5. View profit calculation
6. View change orders impact

### Supabase Operations

- SELECT from `projects` table
- SELECT from `project_budget_items` table
- SELECT from `change_orders` table where status is "approved"
- SELECT from `discounts` table (if applicable)

### Calculations

- Original Contract Value: `currentContractValue - totalCoRevenueImpact`
- Original Budget: `currentBudget - totalCoCostImpact`
- Expected Revenue: `currentContractValue - totalDiscounts`
- Gross Profit: `expectedRevenue - currentBudget`
- Gross Profit Percentage: `(grossProfit / expectedRevenue) * 100`
- Cost Variance: `currentBudget - actualExpenses`

## Flow Chart: Estimate to Project Conversion

```
[Create Estimate] --> [Draft Status]
    |
    v
[Update Estimate] --> [Send Estimate]
    |                     |
    |                     v
    |                [Sent Status]
    |                     |
    |                     v
    |               [Customer Approves]
    |                     |
    |                     v
    |              [Approved Status]
    |                     |
    |                     v
    +------------------>[Convert to Project]
                              |
                              v
                      [Project Created]
                              |
                              v
                    [Budget Items Created]
                              |
                              v
                        [Link Estimate]
                              |
                              v
                     [Converted Status]
```

## Flow Chart: Budget Management

```
[View Project] --> [Budget Tab]
     |
     v
[Update Budget] --> [Add/Edit Items]
     |                  |
     |                  v
     |            [Update Amounts]
     |                  |
     |                  v
     |           [Recalculate Totals]
     |                  |
     |                  v
     +------------->[Save Changes]
                         |
                         v
                   [Budget Updated]
                         |
                         v
               [Financial Summary Updated]
```

## Flow Chart: Change Order Process

```
[View Project] --> [Change Orders Tab]
     |
     v
[Create Change Order] --> [Add Items]
     |                        |
     |                        v
     |                  [Calculate Impacts]
     |                        |
     |                        v
     |                   [Submit for Review]
     |                        |
     |                        v
     |                   [Review Status]
     |                        |
     |                        v
     |                   [Approve/Reject]
     |                        |
     |                        v
     +--------------------->[If Approved]
                                |
                                v
                          [Update Project]
                                |
                                v
                      [Update Contract Value]
                                |
                                v
                        [Update Budget]
```
