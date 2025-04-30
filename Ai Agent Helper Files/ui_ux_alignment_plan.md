# UI/UX Alignment Implementation Plan

This document outlines the step-by-step implementation plan to address all UI/UX inconsistencies identified in the alignment report. Each step includes specific tasks, affected files, and design token references.

## Implementation Steps

| Step | Goal                                  | Key Tasks                                                                                                                                                      | Affected Files/Dirs                                                                                                                                                                                                                           | Design Token Refs                                                                  |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1    | Create Reusable SearchInput Component | - Create standardized SearchInput component<br>- Implement consistent styling with standard padding and border-radius<br>- Update imports across landing pages | - Create: `src/components/ui/search-input.tsx`<br>- Update: `src/components/estimates/EstimatesHeader.tsx`<br>- Update: `src/components/projects/ProjectsHeader.tsx`<br>- Update: `src/components/workOrders/WorkOrdersHeader.tsx`            | `--input`<br>`--border`<br>`--muted-foreground`                                    |
| 2    | Normalize PageHeader Usage            | - Update ProjectsHeader to use PageHeader component consistently<br>- Ensure title/description consistently applied                                            | - Update: `src/components/projects/ProjectsHeader.tsx`<br>- Update: `src/pages/Projects.tsx`                                                                                                                                                  | `--foreground`<br>`--muted-foreground`                                             |
| 3    | Replace Hardcoded Colors              | - Replace hardcoded colors with semantic token classes<br>- Focus on Projects page `bg-[#0485ea]` → `bg-primary`                                               | - Update: `src/components/projects/ProjectsHeader.tsx`<br>- Update: `src/components/workOrders/components/WorkOrderRow.tsx`                                                                                                                   | `--primary`<br>`--primary-foreground`                                              |
| 4    | Standardize Button Styling            | - Apply consistent button size="sm" across all action buttons<br>- Use consistent variant props<br>- Ensure icon + text alignment is consistent                | - Update: `src/components/projects/ProjectsHeader.tsx`<br>- Update: `src/components/estimates/EstimatesHeader.tsx`<br>- Update: `src/components/workOrders/WorkOrdersHeader.tsx`                                                              | `--primary`<br>`--primary-foreground`<br>`--secondary`<br>`--secondary-foreground` |
| 5    | Create EmptyState Component           | - Create reusable EmptyState component with icon, title, description<br>- Replace custom implementations with shared component                                 | - Create: `src/components/ui/empty-state.tsx`<br>- Update: `src/components/estimates/components/EstimateEmptyState.tsx`<br>- Update: `src/components/projects/ProjectsTable.tsx`<br>- Update: `src/components/workOrders/WorkOrdersTable.tsx` | `--muted-foreground`<br>`--foreground`                                             |
| 6    | Standardize Loading States            | - Create or standardize loading component using Skeleton<br>- Replace custom loading states with consistent implementation                                     | - Create: `src/components/ui/table-loading.tsx`<br>- Update: `src/components/projects/ProjectsTable.tsx`<br>- Update: `src/components/workOrders/WorkOrdersTable.tsx`                                                                         | `--muted`                                                                          |
| 7    | Implement Consistent Filter UI        | - Create standardized FilterButton component<br>- Apply consistent dropdown filter UI                                                                          | - Create: `src/components/ui/filter-button.tsx`<br>- Update: `src/components/estimates/EstimatesHeader.tsx`<br>- Update: `src/components/workOrders/WorkOrdersHeader.tsx`                                                                     | `--border`<br>`--secondary`<br>`--secondary-foreground`                            |
| 8    | Normalize Table Styling               | - Standardize table headers and cells<br>- Consistent border, padding, and hover states<br>- Align column layouts while preserving content differences         | - Update: `src/components/estimates/EstimatesTable.tsx`<br>- Update: `src/components/projects/ProjectsTable.tsx`<br>- Update: `src/components/workOrders/WorkOrdersTable.tsx`                                                                 | `--border`<br>`--foreground`<br>`--muted`                                          |
| 9    | Improve Accessibility                 | - Add aria-labels to icon buttons<br>- Ensure proper focus states                                                                                              | - Update: `src/components/estimates/EstimatesHeader.tsx`<br>- Update: `src/components/projects/ProjectsHeader.tsx`<br>- Update: `src/components/workOrders/WorkOrdersHeader.tsx`                                                              | `--ring`                                                                           |
| 10   | Standardize Status Badge Styling      | - Ensure StatusBadge used consistently<br>- Map status values correctly                                                                                        | - Update: `src/components/estimates/components/EstimateRow.tsx`<br>- Update: `src/components/projects/components/ProjectRow.tsx`<br>- Update: `src/components/workOrders/components/WorkOrderRow.tsx`                                         | Various status colors                                                              |

## Acceptance Criteria

For each completed step, the following criteria must be met:

- [x] Visual consistency across all three landing pages
- [x] Component reuse where appropriate
- [x] Proper use of design tokens (no hardcoded colors)
- [x] Consistent padding/spacing
- [x] Responsive behavior preserved
- [x] Accessibility maintained or improved
- [x] Existing functionality preserved

## Testing Notes

### Visual Testing

- Compare all three landing pages side by side
- Verify consistent padding, colors, typography
- Check responsive behavior at multiple viewport sizes
- Ensure hover/focus states are consistent

### Functional Testing

- Verify search functionality works across all pages
- Confirm filters/sorting behavior is preserved
- Test loading states by throttling network
- Ensure empty states display appropriately

## Implementation Progress

- [x] Step 1: Create SearchInput Component
- [x] Step 2: Normalize PageHeader Usage
- [x] Step 3: Replace Hardcoded Colors
- [x] Step 4: Standardize Button Styling
- [x] Step 5: Create EmptyState Component
- [x] Step 6: Standardize Loading States
- [x] Step 7: Implement Consistent Filter UI
- [x] Step 8: Normalize Table Styling
- [x] Step 9: Improve Accessibility
- [x] Step 10: Standardize Status Badge Styling
