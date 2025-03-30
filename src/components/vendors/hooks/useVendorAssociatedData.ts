
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
      // Fetch associated projects using the vendor_associations table
      const { data: projectsData, error: projectsError } = await supabase
        .from('vendor_associations')
        .select('entity_id')
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'PROJECT');
      
      if (projectsError) {
        console.error('Error fetching vendor project associations:', projectsError);
        toast({
          title: 'Error',
          description: 'Failed to load associated projects.',
          variant: 'destructive',
        });
      } else if (projectsData && projectsData.length > 0) {
        // Get the project IDs from the associations
        const projectIds = projectsData.map(item => item.entity_id);
        
        // Fetch the actual project data
        const { data: projects, error: projectsFetchError } = await supabase
          .from('projects')
          .select('*')
          .in('projectid', projectIds);
          
        if (projectsFetchError) {
          console.error('Error fetching project details:', projectsFetchError);
        } else {
          setProjects(projects || []);
        }
      } else {
        setProjects([]);
      }
      
      // Fetch associated work orders from maintenance_work_orders table
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .eq('customer_id', vendorId);
      
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
