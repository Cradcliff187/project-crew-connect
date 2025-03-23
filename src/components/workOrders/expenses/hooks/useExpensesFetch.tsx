
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
      
      // Use the unified view
      const { data, error } = await supabase
        .from('unified_work_order_expenses')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched unified expenses:', data);
      
      // Transform data to ensure types match
      const transformedData = data?.map(item => ({
        id: item.id,
        work_order_id: item.work_order_id,
        vendor_id: item.vendor_id,
        expense_name: item.expense_name || '',
        material_name: item.expense_name || '', // For backward compatibility
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0,
        receipt_document_id: item.receipt_document_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        expense_type: item.expense_type || 'materials',
        source_type: item.source_type as "material" | "time_entry" || "material",
        time_entry_id: item.time_entry_id
      })) as WorkOrderExpense[];
      
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
