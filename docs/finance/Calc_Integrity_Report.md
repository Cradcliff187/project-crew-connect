# Calculation Integrity Report

This document analyzes the integrity of financial calculations within the application and identifies potential issues or inconsistencies.

## 1. Key Financial Calculations

### 1.1 Estimate Line Items

**Location**: `src/components/estimates/detail/EstimateLineItems.tsx`

```tsx
// Calculate subtotal
const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

// Calculate total cost if financial data is available and should be shown
const totalCost = showFinancials
  ? items.reduce((sum, item) => sum + (item.cost || 0) * (item.quantity || 1), 0)
  : 0;

// Calculate total markup if financial data is available
const totalMarkup = showFinancials
  ? items.reduce((sum, item) => {
      const cost = (item.cost || 0) * (item.quantity || 1);
      const markup = item.markup_amount || (cost * (item.markup_percentage || 0)) / 100 || 0;
      return sum + markup;
    }, 0)
  : 0;

// Calculate gross margin
const grossMargin = subtotal - totalCost;
const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;
```

**Assessment**: The calculations appear to be mathematically correct. The code properly handles null values with fallbacks to 0. The gross margin calculation follows standard accounting practices: revenue (subtotal) minus costs.

### 1.2 Estimate Line Items Editor

**Location**: `src/components/estimates/detail/editors/EstimateLineItemsEditor.tsx`

```tsx
// Calculate totals for the line items
const calculateTotals = useCallback(() => {
  const currentItems = getValues(name) || [];
  const { subtotal, totalCost } = currentItems.reduce(
    (acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.unit_cost) || 0;
      const markupPercentage = Number(item.markup_percentage) || 0;

      const itemCost = quantity * unitCost;
      const itemPrice = itemCost * (1 + markupPercentage / 100);

      return {
        subtotal: acc.subtotal + itemPrice,
        totalCost: acc.totalCost + itemCost,
      };
    },
    { subtotal: 0, totalCost: 0 }
  );
}, [getValues, name]);

// Calculate item values when input changes
const calculateItemValues = useCallback(
  (index: number) => {
    const quantity = Number(form.getValues(`${name}.${index}.quantity`)) || 0;
    const unitPrice = Number(form.getValues(`${name}.${index}.unit_price`)) || 0;
    const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;

    // Calculate totals
    const totalPrice = quantity * unitPrice;

    // Only set total price directly from here, others are handled elsewhere
    form.setValue(`${name}.${index}.total_price`, totalPrice.toFixed(2), {
      shouldValidate: false,
      shouldDirty: true,
    });
  },
  [form, name]
);
```

**Assessment**:

- **Issue #1**: In `calculateTotals`, there's a calculation using `itemPrice = itemCost * (1 + markupPercentage / 100)`, but in other components, markup is calculated differently (added to the cost, not multiplied). This inconsistency could lead to different calculations for the same items.
- **Issue #2**: The `calculateItemValues` function only updates the `total_price` field but not other derived values like gross margin.

### 1.3 Financial Summary Tab

**Location**: `src/components/projects/detail/tabs/FinancialSummaryTab.tsx`

```tsx
// Base Project Values
const currentContractValue = project.contract_value || 0;
const currentBudget = project.total_budget || 0;
const actualExpenses = project.current_expenses || 0;

// Discounts
const totalDiscounts = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);

// Change Orders
const totalCoRevenueImpact = approvedChangeOrders.reduce(
  (sum, co) => sum + (co.revenue_impact || 0),
  0
);
const totalCoCostImpact = approvedChangeOrders.reduce((sum, co) => sum + (co.cost_impact || 0), 0);

// Derived Values
const originalContractValue = currentContractValue - totalCoRevenueImpact;
const originalBudget = currentBudget - totalCoCostImpact;
const expectedRevenue = Math.max(0, currentContractValue - totalDiscounts);
const grossProfit = expectedRevenue - currentBudget;
const grossProfitPercentage = expectedRevenue > 0 ? (grossProfit / expectedRevenue) * 100 : 0;
const costVariance = currentBudget - actualExpenses;
```

**Assessment**:

- The calculations are correct for what they intend to calculate.
- **Issue #3**: There's no validation for potential negative values in budget or cost calculations which could lead to misleading results.
- **Issue #4**: `expectedRevenue` uses `Math.max(0, ...)` to prevent negative values, but this pattern isn't consistently applied to other calculations.

### 1.4 Project Budget Tab

**Location**: `src/components/projects/detail/tabs/ProjectBudgetTab.tsx`

```tsx
// Calculate totals from the items provided
const totalEstimatedRevenue = budgetItems.reduce(
  (sum, item) => sum + (item.estimated_amount || 0),
  0
);
const totalEstimatedCost = budgetItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
const totalActualCost = budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);

// Calculate Margins
const estimatedGrossMargin = totalEstimatedRevenue - totalEstimatedCost;
const actualGrossMargin = totalEstimatedRevenue - totalActualCost; // Assuming revenue doesn't change, only cost does

// Calculate Variances
const totalCostVariance = totalEstimatedCost - totalActualCost; // Positive means under budget, negative means over budget
const overallProjectVariance = (totalBudget || 0) - totalActualCost;
```

**Assessment**:

- The calculations are correct for basic financial tracking.
- **Issue #5**: The comment implies that positive variance means under budget, but that depends on the interpretation. Clearer labeling in UI would be needed.
- **Issue #6**: `actualGrossMargin` assumes revenue doesn't change, which may not always be true if additional work is done.

## 2. Utility Functions

### 2.1 Report Utils

**Location**: `src/utils/reportUtils.ts`

```ts
// Calculate budget utilization percentage
if (processed.total_budget && processed.total_budget > 0) {
  processed.budget_utilization = (processed.current_expenses / processed.total_budget) * 100;
} else {
  processed.budget_utilization = 0;
}

// Calculate gross margin and gross margin percentage
const totalCost = processed.original_base_cost || 0;

// Calculate gross margin (revenue - cost)
processed.gross_margin = contractValue - totalCost;

// Calculate gross margin percentage
if (contractValue > 0) {
  processed.gross_margin_percentage = (processed.gross_margin / contractValue) * 100;
} else {
  processed.gross_margin_percentage = 0;
}
```

**Assessment**:

- The calculations follow standard accounting principles.
- **Issue #7**: The `budget_utilization` calculation uses `current_expenses / total_budget`, but doesn't account for revenue changes from change orders.
- **Issue #8**: The `gross_margin` calculation uses `original_base_cost`, which may not include updated costs from change orders or actual expenses.

## 3. Calculation Tests

No formal unit tests were found specifically for financial calculations. This is a potential risk area as it means calculation integrity isn't automatically verified on code changes.

### Recommended Test Cases

1. **Estimate Item Calculations**

   - **Test Case**: Calculate total_price for an item with quantity and unit_price
   - **Expected Result**: quantity \* unit_price
   - **Status**: Not implemented

2. **Markup Calculations**

   - **Test Case**: Calculate markup for an item with cost and markup_percentage
   - **Expected Result**: cost \* (markup_percentage / 100)
   - **Status**: Not implemented

3. **Gross Margin Calculations**

   - **Test Case**: Calculate gross margin for a project with revenue and costs
   - **Expected Result**: revenue - costs
   - **Status**: Not implemented

4. **Budget Variance Calculations**
   - **Test Case**: Calculate variance between estimated and actual costs
   - **Expected Result**: estimated_cost - actual_cost
   - **Status**: Not implemented

## 4. Issues Summary

1. **Inconsistent Markup Calculations**: Different components use different formulas for calculating markup.
2. **Incomplete Derived Value Updates**: Some components update only part of the dependent values when a change occurs.
3. **Lack of Validation for Negative Values**: Some calculations don't account for potential negative values.
4. **Inconsistent Use of Fallback Patterns**: `Math.max(0, ...)` is used in some places but not others.
5. **Ambiguous Variance Interpretation**: The sign convention for "under budget" vs "over budget" could be clearer.
6. **Revenue Assumption in Margin Calculation**: Actual gross margin calculation assumes fixed revenue.
7. **Incomplete Budget Utilization Calculation**: Doesn't fully account for change orders.
8. **Potentially Outdated Cost Base**: Gross margin uses original cost rather than actual cost.
9. **Lack of Formal Unit Tests**: No automated testing for financial calculations was found.

## 5. Recommendations

1. Standardize markup calculations across all components
2. Implement a shared financial calculation utility module
3. Add validation for all financial inputs and calculations
4. Establish consistent patterns for handling edge cases (zero/negative values)
5. Add clear labeling for variance indicators in the UI
6. Implement comprehensive unit tests for all financial calculations
7. Document the expected behavior for all financial formulas
8. Consider adding realtime validation for user inputs that affect financial calculations
