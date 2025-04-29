import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder'; // Using the correct import

// Define the Project type to avoid conflicts
interface Project {
  projectid: string;
  projectname: string;
  status: string;
}

export const useSubcontractorAssociatedData = () => {
  const [projects, setProjects] = useState<any[]>([]); // Replace any later
  const [workOrders, setWorkOrders] = useState<any[]>([]); // Replace any later
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssociatedData = useCallback(async (subcontractorId: string | undefined) => {
    if (!subcontractorId) return;

    setLoading(true);
    setError(null);
    setProjects([]);
    setWorkOrders([]);

    try {
      // Fetch associated entity IDs from subcontractor_associations
      const { data: associations, error: assocError } = await supabase
        .from('subcontractor_associations')
        .select('entity_id, entity_type')
        .eq('subcontractor_id', subcontractorId);

      if (assocError) throw assocError;

      const projectIds = associations
        ?.filter(a => a.entity_type === 'PROJECT')
        .map(a => a.entity_id);
      const workOrderIds = associations
        ?.filter(a => a.entity_type === 'WORK_ORDER')
        .map(a => a.entity_id);

      // Fetch Projects based on associated IDs
      if (projectIds && projectIds.length > 0) {
        const { data: projectData, error: projError } = await supabase
          .from('projects')
          .select('*') // Select specific fields later if needed
          .in('projectid', projectIds);
        if (projError) throw projError;
        setProjects(projectData || []);
      } else {
        setProjects([]);
      }

      // Fetch Work Orders based on associated IDs
      if (workOrderIds && workOrderIds.length > 0) {
        const { data: woData, error: woError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status, due_by_date, progress, project_id') // Keep required fields
          .in('work_order_id', workOrderIds); // Filter by work_order_id

        if (woError) throw woError;
        setWorkOrders(woData || []);
      } else {
        setWorkOrders([]);
      }
    } catch (err: any) {
      console.error('Error fetching subcontractor associated data:', err);
      setError(err.message || 'Failed to load associated data');
      setProjects([]);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, workOrders, loading, error, fetchAssociatedData };
};
