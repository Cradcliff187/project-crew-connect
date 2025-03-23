
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderMaterial } from '@/types/workOrder';

export function useMaterialsFetch(workOrderId: string) {
  const [materials, setMaterials] = useState<WorkOrderMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching materials for work order:', workOrderId);
      const { data, error } = await (supabase as any)
        .from('work_order_materials')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched materials:', data);
      
      // Transform DB data to match WorkOrderMaterial type
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
        expense_type: item.expense_type || 'materials',
        source_type: 'material' as const
      })) as WorkOrderMaterial[];
      
      setMaterials(transformedData || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load materials: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);
  
  useEffect(() => {
    if (workOrderId) {
      fetchMaterials();
    }
  }, [workOrderId, fetchMaterials]);
  
  return {
    materials,
    loading,
    error,
    fetchMaterials
  };
}
