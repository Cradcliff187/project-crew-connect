
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderExpense } from '@/types/workOrder';

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
      // Detailed logging to help debug the issue
      console.log('Adding expense with payload:', {
        work_order_id: workOrderId,
        vendor_id: expense.vendorId,
        material_name: expense.expenseName, // Using material_name field in DB
        expense_type: expense.expenseType || 'materials',
        quantity: expense.quantity,
        unit_price: expense.unitPrice,
        total_price: totalPrice,
      });
      
      // Validate that workOrderId is a valid UUID
      if (!workOrderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workOrderId)) {
        throw new Error(`Invalid work order ID format: ${workOrderId}`);
      }
      
      const { data, error, status } = await supabase
        .from('work_order_materials')
        .insert({
          work_order_id: workOrderId,
          vendor_id: expense.vendorId,
          material_name: expense.expenseName, // Using material_name field in DB
          quantity: expense.quantity,
          unit_price: expense.unitPrice,
          total_price: totalPrice,
          expense_type: expense.expenseType || 'materials',
        })
        .select();
      
      if (error) {
        console.error('Supabase error details:', { error, status });
        throw error;
      }
      
      console.log('Expense added successfully:', data);
      
      toast({
        title: 'Expense Added',
        description: 'Expense has been added successfully.',
      });
      
      // Transform database response to expense format with both field names
      const addedExpense: WorkOrderExpense = {
        id: data[0].id,
        work_order_id: data[0].work_order_id,
        vendor_id: data[0].vendor_id,
        expense_name: data[0].material_name,
        material_name: data[0].material_name, // Add for backward compatibility
        quantity: data[0].quantity,
        unit_price: data[0].unit_price,
        total_price: data[0].total_price,
        receipt_document_id: data[0].receipt_document_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        expense_type: data[0].expense_type || 'materials'
      };
      
      // Return the newly created expense
      return addedExpense;
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
      console.log('Deleting expense with ID:', id);
      const { error } = await supabase
        .from('work_order_materials')
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
