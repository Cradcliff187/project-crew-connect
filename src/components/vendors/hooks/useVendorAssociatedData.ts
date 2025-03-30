
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VendorProject, VendorWorkOrder } from '../detail/types';

/**
 * Hook to fetch vendor associated data like projects and work orders
 */
const useVendorAssociatedData = () => {
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [workOrders, setWorkOrders] = useState<VendorWorkOrder[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);
  
  const fetchAssociatedData = useCallback(async (vendorId: string) => {
    if (!vendorId) return;
    
    setLoadingAssociations(true);
    
    try {
      // Fetch associated projects using the get_vendor_projects database function
      const { data: projectsData, error: projectsError } = await supabase
        .rpc('get_vendor_projects', { p_vendor_id: vendorId });
      
      if (projectsError) {
        console.error('Error fetching vendor project associations:', projectsError);
        toast({
          title: 'Error',
          description: 'Failed to load associated projects.',
          variant: 'destructive',
        });
        setProjects([]);
      } else {
        setProjects(projectsData || []);
      }
      
      // Fetch associated work orders using the get_vendor_work_orders database function
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .rpc('get_vendor_work_orders', { p_vendor_id: vendorId });
      
      if (workOrdersError) {
        console.error('Error fetching vendor work orders:', workOrdersError);
        toast({
          title: 'Error',
          description: 'Failed to load associated work orders.',
          variant: 'destructive',
        });
        setWorkOrders([]);
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
      setProjects([]);
      setWorkOrders([]);
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
