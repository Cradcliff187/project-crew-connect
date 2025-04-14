/**
 * Helper functions for expense management
 */

/**
 * Safely extracts the budget item category from the budget item object
 */
export const getBudgetItemCategory = (budgetItem: any): string | null => {
  if (!budgetItem) return null;
  if (typeof budgetItem !== 'object') return null;
  return budgetItem.category || null;
};

/**
 * Formats a currency value for display
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date string into a readable format
 */
export const formatExpenseDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Need to import format from date-fns for the date formatting function
import { format } from 'date-fns';
