import { useState, useCallback } from 'react';
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
  const fetchAssociatedData = useCallback(async (vendorId: string) => {
    if (!vendorId) return;

    setLoadingAssociations(true);

    try {
      // Step 1: Get project associations
      const { data: projectAssociations, error: projectAssociationsError } = await supabase
        .from('vendor_associations')
        .select('entity_id')
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'PROJECT');

      if (projectAssociationsError) {
        console.error('Error fetching project associations:', projectAssociationsError);
        setProjects([]);
      } else if (projectAssociations && projectAssociations.length > 0) {
        // Extract project IDs from associations
        const projectIds = projectAssociations.map(association => association.entity_id);

        // Step 2: Fetch the actual projects using the IDs we collected
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, status, createdon, total_budget')
          .in('projectid', projectIds);

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          setProjects([]);
        } else if (projectsData) {
          // Transform projects data to match our interface
          const vendorProjects: VendorProject[] = projectsData.map(project => ({
            projectid: project.projectid,
            projectname: project.projectname,
            status: project.status || 'Unknown',
            createdon: project.createdon,
            total_budget: project.total_budget,
          }));

          setProjects(vendorProjects);
        }
      } else {
        setProjects([]);
      }

      // Step 1: Get work order associations
      const { data: workOrderAssociations, error: workOrderAssociationsError } = await supabase
        .from('vendor_associations')
        .select('entity_id')
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'WORK_ORDER');

      if (workOrderAssociationsError) {
        console.error('Error fetching work order associations:', workOrderAssociationsError);
        setWorkOrders([]);
      } else if (workOrderAssociations && workOrderAssociations.length > 0) {
        // Extract work order IDs from associations
        const workOrderIds = workOrderAssociations.map(association => association.entity_id);

        // Step 2: Fetch the actual work orders using the IDs we collected
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status, created_at, progress, materials_cost')
          .in('work_order_id', workOrderIds);

        if (workOrdersError) {
          console.error('Error fetching work orders:', workOrdersError);
          setWorkOrders([]);
        } else if (workOrdersData) {
          // Transform work orders data to match our interface
          const vendorWorkOrders: VendorWorkOrder[] = workOrdersData.map(workOrder => ({
            work_order_id: workOrder.work_order_id,
            title: workOrder.title,
            status: workOrder.status || 'Unknown',
            created_at: workOrder.created_at,
            progress: workOrder.progress,
            materials_cost: workOrder.materials_cost,
          }));

          setWorkOrders(vendorWorkOrders);
        }
      } else {
        setWorkOrders([]);
      }
    } catch (error) {
      console.error('Error in fetchAssociatedData:', error);
      setProjects([]);
      setWorkOrders([]);
    } finally {
      setLoadingAssociations(false);
    }
  }, []);

  return { projects, workOrders, loadingAssociations, fetchAssociatedData };
};

export default useVendorAssociatedData;
