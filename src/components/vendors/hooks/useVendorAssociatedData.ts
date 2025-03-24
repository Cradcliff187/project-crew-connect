
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorProject, VendorWorkOrder } from '../detail/types';

export const useVendorAssociatedData = () => {
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [workOrders, setWorkOrders] = useState<VendorWorkOrder[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const fetchAssociatedData = async (vendorId: string | undefined) => {
    if (!vendorId) return;

    setLoadingAssociations(true);
    try {
      // Fetch work orders associated with this vendor using the new function
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .rpc('get_vendor_work_orders', { p_vendor_id: vendorId });
        
      if (workOrdersError) {
        console.error('Error fetching vendor work order associations:', workOrdersError);
      } else {
        setWorkOrders(workOrdersData || []);
      }

      // Fetch projects associated with this vendor using the new function
      const { data: projectsData, error: projectsError } = await supabase
        .rpc('get_vendor_projects', { p_vendor_id: vendorId });
        
      if (projectsError) {
        console.error('Error fetching vendor project associations:', projectsError);
      } else {
        setProjects(projectsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching vendor associated data:', error);
    } finally {
      setLoadingAssociations(false);
    }
  };

  return {
    projects,
    workOrders,
    loadingAssociations,
    fetchAssociatedData
  };
};

export default useVendorAssociatedData;
