
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubcontractorAssociatedData = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const fetchAssociatedData = async (subcontractorId: string | undefined) => {
    if (!subcontractorId) return;

    setLoadingAssociations(true);
    try {
      // Fetch projects where the subcontractor is associated through documents
      const { data: projectData, error: projectError } = await supabase
        .from('documents')
        .select('entity_id')
        .eq('vendor_id', subcontractorId)
        .eq('vendor_type', 'subcontractor')
        .eq('entity_type', 'PROJECT');
        
      if (projectError) {
        console.error('Error fetching subcontractor project associations:', projectError);
      } else if (projectData && projectData.length > 0) {
        // Get unique project IDs
        const uniqueProjectIds = [...new Set(projectData.map(item => item.entity_id))].filter(Boolean);
        
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

      // Fetch work orders associated with this subcontractor
      const { data: woLaborsData, error: woLaborsError } = await supabase
        .from('work_order_labor')
        .select('work_order_id')
        .eq('subcontractor_id', subcontractorId);
      
      if (woLaborsError) {
        console.error('Error fetching subcontractor work order associations:', woLaborsError);
      } else if (woLaborsData && woLaborsData.length > 0) {
        // Get unique work order IDs
        const uniqueWorkOrderIds = [...new Set(woLaborsData.map(item => item.work_order_id))].filter(Boolean);
        
        if (uniqueWorkOrderIds.length > 0) {
          // Fetch detailed work order information
          const { data: workOrdersData, error: workOrdersError } = await supabase
            .from('maintenance_work_orders')
            .select('work_order_id, title, status, created_at, labor_cost')
            .in('work_order_id', uniqueWorkOrderIds);
            
          if (!workOrdersError) {
            setWorkOrders(workOrdersData || []);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching subcontractor associated data:', error);
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

export default useSubcontractorAssociatedData;
