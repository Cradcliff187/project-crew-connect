
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
      console.log('Adding expense with payload:', {
        work_order_id: workOrderId,
        vendor_id: expense.vendorId,
        material_name: expense.expenseName,
        expense_type: expense.expenseType || 'materials',
        quantity: expense.quantity,
        unit_price: expense.unitPrice,
        total_price: totalPrice,
      });
      
      // Validate that workOrderId is a valid UUID
      if (!workOrderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workOrderId)) {
        throw new Error(`Invalid work order ID format: ${workOrderId}`);
      }
      
      // Cast the table name to any to bypass TypeScript checking
      const { data, error } = await (supabase as any)
        .from('work_order_materials')
        .insert({
          work_order_id: workOrderId,
          vendor_id: expense.vendorId,
          material_name: expense.expenseName,
          quantity: expense.quantity,
          unit_price: expense.unitPrice,
          total_price: totalPrice,
          expense_type: expense.expenseType || 'materials',
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
      
      // Transform database response to standard object format
      const addedExpense = {
        id: data[0].id,
        work_order_id: data[0].work_order_id,
        vendor_id: data[0].vendor_id,
        expense_name: data[0].material_name,
        material_name: data[0].material_name,
        quantity: data[0].quantity,
        unit_price: data[0].unit_price,
        total_price: data[0].total_price,
        receipt_document_id: data[0].receipt_document_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        expense_type: data[0].expense_type || 'materials',
        source_type: 'material' as const
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
      // First, fetch the expense to get the receipt_document_id if it exists
      const { data: expense, error: fetchError } = await (supabase as any)
        .from('work_order_materials')
        .select('receipt_document_id, material_name')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      console.log('Deleting expense with ID:', id, 'Receipt document ID:', expense?.receipt_document_id);
      
      // If there's a receipt document, fetch its storage_path
      if (expense?.receipt_document_id) {
        const { data: document, error: docError } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('document_id', expense.receipt_document_id)
          .single();
        
        if (docError && docError.code !== 'PGRST116') { // PGRST116 is "Not found" which might happen if the document was already deleted
          console.warn('Error fetching document:', docError);
          // Continue with deletion even if we can't fetch the document
        } else if (document?.storage_path) {
          console.log('Deleting file from storage:', document.storage_path);
          
          // Delete the file from storage
          const { error: storageError } = await supabase.storage
            .from('construction_documents')
            .remove([document.storage_path]);
          
          if (storageError) {
            console.warn('Error deleting file from storage:', storageError);
            // Continue with deletion even if we can't delete the file
          }
        }
      }
      
      // Delete the expense record from the database
      // The database trigger will handle deleting the document record
      const { error } = await (supabase as any)
        .from('work_order_materials')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Expense Deleted',
        description: `The expense "${expense?.material_name || ''}" has been deleted successfully.`,
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
