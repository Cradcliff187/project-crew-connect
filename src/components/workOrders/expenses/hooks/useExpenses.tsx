import { useExpensesFetch } from './useExpensesFetch';
import { useExpenseOperations } from './useExpenseOperations';
import { useReceiptOperations } from './useReceiptOperations';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useExpenses(workOrderId: string) {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);

  // Fetch expenses data
  const { expenses, loading, error, fetchExpenses } = useExpensesFetch(workOrderId);

  // Expense CRUD operations
  const { submitting, handleAddExpense, handleDelete } = useExpenseOperations(
    workOrderId,
    fetchExpenses
  );

  // Receipt operations
  const { handleReceiptUploaded } = useReceiptOperations(fetchExpenses);

  // Calculate total expenses cost
  const totalExpensesCost = expenses.reduce((sum, expense) => sum + expense.total_price, 0);

  // Fetch vendors for dropdown and display
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .eq('status', 'ACTIVE')
        .order('vendorname');

      if (error) throw error;

      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    expenses,
    loading,
    submitting,
    error,
    vendors,
    totalExpensesCost,
    handleAddExpense,
    handleDelete,
    handleReceiptUploaded,
    fetchExpenses,
  };
}
