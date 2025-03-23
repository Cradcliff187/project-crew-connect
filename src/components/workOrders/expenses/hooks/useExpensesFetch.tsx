
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
      
      // Fetch from the unified view instead of direct table
      const { data, error } = await supabase
        .from('unified_work_order_expenses')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched unified expenses:', data);
      
      // Ensure material_name is set for backward compatibility
      const transformedData = data?.map(item => ({
        ...item,
        material_name: item.expense_name // Keep for backward compatibility
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
