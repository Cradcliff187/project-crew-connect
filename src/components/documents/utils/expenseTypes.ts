
// Define expense types for receipts
export const expenseTypes = [
  'materials',
  'equipment',
  'supplies',
  'other'
] as const;

// For backward compatibility - alias expenseTypes as costTypes
export const costTypes = expenseTypes;

export type ExpenseType = typeof expenseTypes[number];

// Helper functions for expense types
export const getExpenseTypeLabel = (type: ExpenseType | string | null): string => {
  if (!type) return 'Other';
  // Capitalize first letter
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const getDefaultExpenseType = (): ExpenseType => 'other';
