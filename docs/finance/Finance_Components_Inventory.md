# Finance Components Inventory

This document catalogs all finance-related components found in the codebase according to the 360° Financial Ecosystem Audit.

## Estimate Components

| Path                                                                  | Export                        | Purpose                                                    | Key Props                                                                                          | Last Modified |
| --------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| `src/components/estimates/detail/EstimateLineItems.tsx`               | `EstimateLineItems`           | Displays estimate line items with financial calculations   | `items`, `showFinancials`                                                                          | -             |
| `src/components/estimates/detail/editors/EstimateLineItemsEditor.tsx` | `EstimateLineItemsEditor`     | Editor for estimate line items with financial calculations | `form`, `name`, `estimateId`, `hideFinancialSummary`                                               | -             |
| `src/components/estimates/detail/content/EstimateItemsContent.tsx`    | `EstimateItemsContent`        | Displays estimate items with financial summary             | `items`, `subtotal`, `contingencyAmount`, `contingencyPercentage`, `total`, `showFinancialDetails` | -             |
| `src/components/estimates/detail/RevisionFinancialComparison.tsx`     | `RevisionFinancialComparison` | Compares financial metrics between estimate revisions      | -                                                                                                  | -             |

## Budget Components

| Path                                                             | Export                  | Purpose                                                  | Key Props                                                                      | Last Modified |
| ---------------------------------------------------------------- | ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- |
| `src/components/projects/budget/ProjectBudget.tsx`               | `ProjectBudget`         | Main project budget management component                 | `projectId`                                                                    | -             |
| `src/components/projects/detail/tabs/ProjectBudgetTab.tsx`       | `ProjectBudgetTab`      | Displays project budget items and financial calculations | `budgetItems`, `totalBudget`                                                   | -             |
| `src/components/projects/detail/tabs/FinancialSummaryTab.tsx`    | `FinancialSummaryTab`   | Project financial overview with calculations             | `project`, `budgetItems`, `approvedChangeOrders`, `discounts`, `onDataRefresh` | -             |
| `src/components/projects/createWizard/Step2_BudgetLineItems.tsx` | `Step2_BudgetLineItems` | Budget line items creation in project wizard             | `formData`, `onNext`, `wizardFormActions`                                      | -             |
| `src/components/projects/detail/tabs/ProjectOverviewTab.tsx`     | `ProjectOverviewTab`    | Project overview with financial metrics                  | `project`, `customerName`, `customerId`, `onEditClick`, `onAddItemClick`       | -             |
| `src/components/projects/detail/cards/FinancialSnapshotCard.tsx` | `FinancialSnapshotCard` | Financial summary card                                   | `contractValue`, `budget`, `spent`, `estimatedGP`                              | -             |

## Change Order Components

| Path | Export | Purpose | Key Props | Last Modified |
| ---- | ------ | ------- | --------- | ------------- |
| TBD  | TBD    | TBD     | TBD       | TBD           |

## Financial Utility Functions

| Path                             | Export  | Purpose                                   | Key Props | Last Modified |
| -------------------------------- | ------- | ----------------------------------------- | --------- | ------------- |
| `src/utils/reportUtils.ts`       | Various | Financial calculations for reports        | -         | -             |
| `src/utils/fieldMapping.ts`      | Various | Field mapping for financial entities      | -         | -             |
| `src/utils/statusTransitions.ts` | Various | Status transitions for financial entities | -         | -             |

## Financial Types

| Path                          | Export                           | Purpose                                       | Key Props | Last Modified |
| ----------------------------- | -------------------------------- | --------------------------------------------- | --------- | ------------- |
| `src/types/changeOrders.ts`   | `ChangeOrder`, `ChangeOrderItem` | Change order interfaces with financial fields | -         | -             |
| `src/types/workOrder.ts`      | `WorkOrder`                      | Work order interface with cost fields         | -         | -             |
| `src/types/timeTracking.ts`   | Time tracking types              | Time tracking with cost rate                  | -         | -             |
| `src/types/workOrderLinks.ts` | Work order link types            | Links to budget items                         | -         | -             |

## Database Functions

| Path                                              | Export                        | Purpose                                           | Key Props | Last Modified |
| ------------------------------------------------- | ----------------------------- | ------------------------------------------------- | --------- | ------------- |
| `db/functions/convert_estimate_to_project.sql`    | `convert_estimate_to_project` | Converts estimate to project with budget items    | -         | -             |
| `db/migrations/001_convert_estimate_function.sql` | `convert_estimate_to_project` | Creates function to convert estimates to projects | -         | -             |
