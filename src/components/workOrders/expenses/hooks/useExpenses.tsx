
import { useExpensesFetch } from './useExpensesFetch';
import { useExpenseOperations } from './useExpenseOperations';
import { useReceiptOperations } from './useReceiptOperations';

export function useExpenses(workOrderId: string) {
  // Fetch expenses data
  const { 
    expenses, 
    loading, 
    error, 
    fetchExpenses 
  } = useExpensesFetch(workOrderId);
  
  // Expense CRUD operations
  const { 
    submitting, 
    handleAddExpense, 
    handleDelete 
  } = useExpenseOperations(workOrderId, fetchExpenses);
  
  // Receipt operations
  const { 
    handleReceiptUploaded 
  } = useReceiptOperations(fetchExpenses);
  
  // Calculate total expenses cost
  const totalExpensesCost = expenses.reduce((sum, expense) => sum + expense.total_price, 0);
  
  return {
    expenses,
    loading,
    submitting,
    error,
    totalExpensesCost,
    handleAddExpense,
    handleDelete,
    handleReceiptUploaded,
    fetchExpenses
  };
}
