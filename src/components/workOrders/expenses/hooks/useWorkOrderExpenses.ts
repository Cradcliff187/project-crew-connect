
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderExpense } from '@/types/workOrder';

export function useWorkOrderExpenses(workOrderId: string) {
  const [expenses, setExpenses] = useState<WorkOrderExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchExpenses = async () => {
    if (!workOrderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching expenses for work order:", workOrderId);
      const { data, error } = await supabase
        .from('unified_work_order_expenses')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched expenses:", data);
      
      if (data) {
        // Transform data to ensure types match our WorkOrderExpense interface
        const transformedData = data.map(item => ({
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
          // Cast as the expected union type
          source_type: (item.source_type || 'material') as 'material' | 'time_entry',
          time_entry_id: item.time_entry_id
        })) as WorkOrderExpense[];
        
        setExpenses(transformedData);
      } else {
        setExpenses([]);
      }
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load expenses: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExpenses();
  }, [workOrderId]);
  
  return {
    expenses,
    loading,
    error,
    fetchExpenses
  };
}
