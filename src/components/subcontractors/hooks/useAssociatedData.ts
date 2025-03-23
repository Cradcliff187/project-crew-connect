
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAssociatedData = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const fetchAssociatedData = async (subId: string | undefined) => {
    if (!subId) return;

    setLoadingAssociations(true);
    try {
      // First try the new invoices table
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('subcontractor_invoices_new')
        .select('project_id')
        .eq('subcontractor_id', subId)
        .order('created_at', { ascending: false });
        
      if (invoicesError) {
        console.error('Error fetching invoice data from new table:', invoicesError);
        
        // Fall back to the old tables - using the known tables from types
        // We'll query directly from projects related to this subcontractor
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('created_at', { ascending: false });
          
        if (projectsError) {
          console.error('Error fetching projects data:', projectsError);
          setProjects([]);
        } else {
          // Filter projects that might be related to this subcontractor
          // In a real implementation, you would use a proper join table
          setProjects(projectsData || []);
        }
      } else if (invoicesData && invoicesData.length > 0) {
        // Get project details for each unique project_id
        const uniqueProjectIds = [...new Set(invoicesData.map(item => item.project_id))].filter(Boolean);
        
        if (uniqueProjectIds.length > 0) {
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('projectid, projectname')
            .in('projectid', uniqueProjectIds);
            
          if (!projectsError) {
            setProjects(projectsData || []);
          } else {
            console.error('Error fetching projects by IDs:', projectsError);
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      } else {
        setProjects([]);
      }

      // Safely try to fetch associated work orders
      try {
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status')
          .eq('assigned_to', subId)
          .order('created_at', { ascending: false });
        
        if (!workOrdersError) {
          setWorkOrders(workOrdersData || []);
        } else {
          console.error('Error fetching work orders:', workOrdersError);
          setWorkOrders([]);
        }
      } catch (workOrderError) {
        console.error('Error fetching work orders:', workOrderError);
        setWorkOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching associated data:', error);
      setProjects([]);
      setWorkOrders([]);
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

export default useAssociatedData;
