
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useExpenseOperations(workOrderId: string, fetchExpenses: () => Promise<void>) {
  const [submitting, setSubmitting] = useState(false);
  
  const handleAddExpense = async (expense: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType?: string;
  }) => {
    if (!expense.expenseName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an expense name.',
        variant: 'destructive',
      });
      return null;
    }
    
    if (expense.quantity <= 0 || expense.unitPrice <= 0) {
      toast({
        title: 'Invalid Values',
        description: 'Quantity and price must be greater than zero.',
        variant: 'destructive',
      });
      return null;
    }
    
    const totalPrice = expense.quantity * expense.unitPrice;
    
    setSubmitting(true);
    
    try {
      console.log('Adding expense with payload:', {
        entity_id: workOrderId,
        entity_type: 'WORK_ORDER',
        description: expense.expenseName,
        expense_type: expense.expenseType || 'MATERIAL',
        quantity: expense.quantity,
        unit_price: expense.unitPrice,
        amount: totalPrice,
        vendor_id: expense.vendorId,
      });
      
      // Validate that workOrderId is a valid UUID
      if (!workOrderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workOrderId)) {
        throw new Error(`Invalid work order ID format: ${workOrderId}`);
      }
      
      // Insert into the expenses table
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          entity_id: workOrderId,
          entity_type: 'WORK_ORDER',
          description: expense.expenseName,
          expense_type: expense.expenseType || 'MATERIAL',
          quantity: expense.quantity,
          unit_price: expense.unitPrice,
          amount: totalPrice,
          vendor_id: expense.vendorId,
        })
        .select();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Expense added successfully:', data);
      
      toast({
        title: 'Expense Added',
        description: 'Expense has been added successfully.',
      });
      
      // Refresh expenses list to reflect the new addition
      await fetchExpenses();
      
      // Return success but don't try to transform the expense
      // as it will be loaded via the unified view in fetchExpenses
      return { success: true };
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense: ' + error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      // Check if this is a time entry expense
      const { data: expenseData } = await supabase
        .from('unified_work_order_expenses')
        .select('source_type')
        .eq('id', id)
        .single();
      
      if (expenseData?.source_type === 'time_entry') {
        toast({
          title: 'Cannot Delete',
          description: 'Time entry expenses cannot be deleted directly.',
          variant: 'destructive',
        });
        return;
      }
      
      // Delete the expense record from the database
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Expense Deleted',
        description: 'The expense has been deleted successfully.',
      });
      
      // Refresh expenses list
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    submitting,
    handleAddExpense,
    handleDelete
  };
}
