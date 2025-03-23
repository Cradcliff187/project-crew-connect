
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVendorAssociatedData = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const fetchAssociatedData = async (vendorId: string | undefined) => {
    if (!vendorId) return;

    setLoadingAssociations(true);
    try {
      // Fetch projects where the vendor is associated through documents
      const { data: projectData, error: projectError } = await supabase
        .from('documents')
        .select('entity_id')
        .eq('vendor_id', vendorId)
        .eq('entity_type', 'project');
        
      if (projectError) {
        console.error('Error fetching vendor project associations:', projectError);
      } else if (projectData && projectData.length > 0) {
        // Get unique project IDs
        const uniqueProjectIds = [...new Set(projectData.map(item => item.entity_id))].filter(Boolean) as string[];
        
        if (uniqueProjectIds.length > 0) {
          // Fetch detailed project information
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('projectid, projectname, status, createdon')
            .in('projectid', uniqueProjectIds);
            
          if (!projectsError) {
            setProjects(projectsData || []);
          }
        }
      }

      // Fetch work orders associated with this vendor
      const { data: woMaterialsData, error: woMaterialsError } = await (supabase as any)
        .from('unified_work_order_expenses')
        .select('work_order_id')
        .eq('vendor_id', vendorId);
      
      if (woMaterialsError) {
        console.error('Error fetching vendor work order associations:', woMaterialsError);
      } else if (woMaterialsData && woMaterialsData.length > 0) {
        // Get unique work order IDs
        const uniqueWorkOrderIds = [...new Set(woMaterialsData.map(item => item.work_order_id))].filter(Boolean) as string[];
        
        if (uniqueWorkOrderIds.length > 0) {
          // Fetch detailed work order information
          const { data: workOrdersData, error: workOrdersError } = await supabase
            .from('maintenance_work_orders')
            .select('work_order_id, title, status, created_at, materials_cost')
            .in('work_order_id', uniqueWorkOrderIds);
            
          if (!workOrdersError) {
            setWorkOrders(workOrdersData || []);
          }
        }
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
