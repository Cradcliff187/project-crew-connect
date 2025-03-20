
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
        
        // Fall back to the old tables
        const { data: legacyInvoicesData, error: legacyInvoicesError } = await supabase
          .from('subinvoices')
          .select('projectid, projectname')
          .eq('subid', subId)
          .order('created_at', { ascending: false });
          
        if (legacyInvoicesError) {
          console.error('Error fetching legacy invoice data:', legacyInvoicesError);
        } else {
          // Get unique projects by projectid
          const uniqueProjects = legacyInvoicesData?.reduce((acc: any[], current) => {
            const x = acc.find(item => item.projectid === current.projectid);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          
          setProjects(uniqueProjects || []);
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
          }
        }
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
        }
      } catch (workOrderError) {
        console.error('Error fetching work orders:', workOrderError);
        // Don't throw error for work orders - just log it
      }
    } catch (error: any) {
      console.error('Error fetching associated data:', error);
      // We don't show a toast here to not disrupt the main flow
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
