
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorProject, VendorWorkOrder } from '../detail/types';

interface UseVendorAssociatedDataResult {
  projects: VendorProject[];
  workOrders: VendorWorkOrder[];
  loadingAssociations: boolean;
  fetchAssociatedData: (vendorId: string) => Promise<void>;
}

/**
 * Hook to fetch data associated with a vendor
 */
const useVendorAssociatedData = (): UseVendorAssociatedDataResult => {
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [workOrders, setWorkOrders] = useState<VendorWorkOrder[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);
  
  /**
   * Fetch all data associated with a vendor
   */
  const fetchAssociatedData = async (vendorId: string) => {
    if (!vendorId) return;
    
    setLoadingAssociations(true);
    
    try {
      // Fetch associated projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('vendor_associations')
        .select(`
          amount, 
          entity_id,
          projects:entity_id(projectid, projectname, status, createdon, total_budget)
        `)
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'PROJECT');
      
      if (projectsError) {
        console.error('Error fetching associated projects:', projectsError);
      } else if (projectsData) {
        // Transform data to get the projects
        const vendorProjects: VendorProject[] = projectsData
          .filter(item => item.projects) // Filter out any null projects
          .map(item => ({
            projectid: item.projects.projectid,
            projectname: item.projects.projectname,
            status: item.projects.status,
            createdon: item.projects.createdon,
            total_budget: item.projects.total_budget
          }));
        
        setProjects(vendorProjects);
      }
      
      // Fetch associated work orders
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('vendor_associations')
        .select(`
          amount, 
          entity_id,
          work_orders:entity_id(work_order_id, title, status, created_at, progress, materials_cost)
        `)
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'WORK_ORDER');
      
      if (workOrdersError) {
        console.error('Error fetching associated work orders:', workOrdersError);
      } else if (workOrdersData) {
        // Transform data to get the work orders
        const vendorWorkOrders: VendorWorkOrder[] = workOrdersData
          .filter(item => item.work_orders) // Filter out any null work orders
          .map(item => ({
            work_order_id: item.work_orders.work_order_id,
            title: item.work_orders.title,
            status: item.work_orders.status,
            created_at: item.work_orders.created_at,
            progress: item.work_orders.progress,
            materials_cost: item.work_orders.materials_cost
          }));
        
        setWorkOrders(vendorWorkOrders);
      }
    } catch (error) {
      console.error('Error in fetchAssociatedData:', error);
    } finally {
      setLoadingAssociations(false);
    }
  };
  
  return { projects, workOrders, loadingAssociations, fetchAssociatedData };
};

export default useVendorAssociatedData;
