
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

      // Fetch work orders associated with this subcontractor through documents
      const { data: woDocData, error: woDocError } = await supabase
        .from('documents')
        .select('entity_id')
        .eq('vendor_id', subcontractorId)
        .eq('vendor_type', 'subcontractor')
        .eq('entity_type', 'WORK_ORDER');
      
      if (woDocError) {
        console.error('Error fetching subcontractor work order associations from documents:', woDocError);
      } else if (woDocData && woDocData.length > 0) {
        // Get unique work order IDs (entity_id in this case is the work_order_id)
        const uniqueWorkOrderIds = [...new Set(woDocData.map(item => item.entity_id))].filter(Boolean);
        
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
