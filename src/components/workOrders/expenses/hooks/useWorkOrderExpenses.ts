
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderExpense } from '@/types/workOrder';

export function useWorkOrderExpenses(workOrderId: string) {
  const [expenses, setExpenses] = useState<WorkOrderExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<{ vendorid: string, vendorname: string }[]>([]);
  const [totalExpensesCost, setTotalExpensesCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch all expenses for this work order from the unified view
  const fetchExpenses = async () => {
    if (!workOrderId) return;
    
    setLoading(true);
    try {
      console.log('Fetching expenses for work order:', workOrderId);
      
      // Query from the unified expenses view
      const { data, error } = await supabase
        .from('unified_work_order_expenses')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Found', data?.length || 0, 'expenses');
      
      // Set expenses and calculate total
      setExpenses(data || []);
      
      const total = (data || []).reduce((sum, expense) => sum + (expense.total_price || 0), 0);
      setTotalExpensesCost(total);
      
      // Fetch vendors for displaying names
      await fetchVendors();
    } catch (error: any) {
      console.error('Error fetching work order expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Add a new expense
  const handleAddExpense = async (expenseData: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType?: string;
  }) => {
    if (!workOrderId) return;
    
    setSubmitting(true);
    try {
      const totalPrice = expenseData.quantity * expenseData.unitPrice;
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          entity_id: workOrderId,
          entity_type: 'WORK_ORDER',
          description: expenseData.expenseName,
          expense_type: expenseData.expenseType || 'MATERIAL',
          quantity: expenseData.quantity,
          unit_price: expenseData.unitPrice,
          amount: totalPrice,
          vendor_id: expenseData.vendorId,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Expense Added',
        description: 'The expense has been added successfully.',
      });
      
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete an expense
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      // First check if this is a time entry expense
      const expense = expenses.find(e => e.id === id);
      
      // Only allow deletion of non-time-entry expenses
      if (expense?.source_type === 'time_entry') {
        toast({
          title: 'Cannot Delete',
          description: 'Time entry expenses cannot be deleted directly.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Expense Deleted',
        description: 'The expense has been deleted successfully.',
      });
      
      // Remove the deleted expense from state
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== id));
      
      // Recalculate total
      setTotalExpensesCost(prev => {
        const deletedExpense = expenses.find(e => e.id === id);
        return prev - (deletedExpense?.total_price || 0);
      });
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense. ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle receipt attachment
  const handleReceiptAttached = async (expenseId: string, documentId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ document_id: documentId })
        .eq('id', expenseId);
      
      if (error) throw error;
      
      toast({
        title: 'Receipt Attached',
        description: 'Receipt has been attached successfully.',
      });
      
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error attaching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach receipt. ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Fetch expenses on component mount
  useEffect(() => {
    if (workOrderId) {
      fetchExpenses();
    }
  }, [workOrderId]);
  
  return {
    expenses,
    loading,
    vendors,
    totalExpensesCost,
    submitting,
    handleAddExpense,
    handleDelete,
    handleReceiptAttached,
    fetchExpenses
  };
}
