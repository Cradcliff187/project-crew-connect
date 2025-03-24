
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch vendor associated data like projects and work orders
 */
const useVendorAssociatedData = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);
  
  const fetchAssociatedData = useCallback(async (vendorId: string) => {
    if (!vendorId) return;
    
    setLoadingAssociations(true);
    
    try {
      // Fetch associated projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .contains('vendor_ids', [vendorId]);
      
      if (projectsError) {
        console.error('Error fetching vendor projects:', projectsError);
        toast({
          title: 'Error',
          description: 'Failed to load associated projects.',
          variant: 'destructive',
        });
      } else {
        setProjects(projectsData || []);
      }
      
      // Fetch associated work orders
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vendor_id', vendorId);
      
      if (workOrdersError) {
        console.error('Error fetching vendor work orders:', workOrdersError);
        toast({
          title: 'Error',
          description: 'Failed to load associated work orders.',
          variant: 'destructive',
        });
      } else {
        setWorkOrders(workOrdersData || []);
      }
    } catch (error) {
      console.error('Error in fetchAssociatedData:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAssociations(false);
    }
  }, []);
  
  return {
    projects,
    workOrders,
    loadingAssociations,
    fetchAssociatedData
  };
};

export default useVendorAssociatedData;
