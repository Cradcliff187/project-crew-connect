
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderExpense } from '@/types/workOrder';

export function useExpensesFetch(workOrderId: string) {
  const [expenses, setExpenses] = useState<WorkOrderExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching expenses for work order:', workOrderId);
      const { data, error } = await supabase
        .from('work_order_materials')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform material data to expense data format
      const transformedData = data?.map(item => ({
        id: item.id,
        work_order_id: item.work_order_id,
        vendor_id: item.vendor_id,
        expense_name: item.material_name,
        material_name: item.material_name, // Keep for backward compatibility
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        receipt_document_id: item.receipt_document_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        expense_type: item.expense_type || 'materials'
      })) as WorkOrderExpense[];
      
      console.log('Fetched and transformed expenses:', transformedData);
      setExpenses(transformedData || []);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load expenses: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);
  
  useEffect(() => {
    if (workOrderId) {
      fetchExpenses();
    }
  }, [workOrderId, fetchExpenses]);
  
  return {
    expenses,
    loading,
    error,
    fetchExpenses
  };
}
