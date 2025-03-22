
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
      const { data, error } = await supabase
        .from('work_order_materials')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched materials:', data);
      setMaterials(data || []);
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
