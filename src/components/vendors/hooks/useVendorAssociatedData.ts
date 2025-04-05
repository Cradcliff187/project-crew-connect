
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
    console.log('Fetching associated data for vendor:', vendorId);
    
    try {
      // Fetch associated projects using a direct query rather than the vendor_projects view
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('projectid, projectname, status, createdon, total_budget')
        .eq('vendor_id', vendorId);
      
      if (projectsError) {
        console.error('Error fetching vendor projects:', projectsError);
        setProjects([]);
      } else {
        console.log('Successfully fetched projects:', projectsData);
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
        console.log('Successfully fetched work orders:', workOrdersData);
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
