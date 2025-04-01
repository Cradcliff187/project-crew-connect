
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder.ts'; // Using the correct import

// Define the Project type to avoid conflicts
interface Project {
  projectid: string;
  projectname: string;
  status: string;
}

export const useSubcontractorAssociatedData = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssociatedData = async (subcontractorId: string) => {
    if (!subcontractorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch work orders associated with the subcontractor
      const { data: workOrderData, error: workOrderError } = await supabase
        .from('maintenance_work_orders')
        .select('work_order_id, title, status, due_by_date, progress, project_id')
        .eq('assigned_to', subcontractorId);
        
      if (workOrderError) throw workOrderError;
      
      // Convert to WorkOrder type with required fields
      const typedWorkOrders: WorkOrder[] = (workOrderData || []).map(wo => ({
        work_order_id: wo.work_order_id,
        title: wo.title,
        status: wo.status,
        due_by_date: wo.due_by_date,
        progress: wo.progress,
        actual_hours: 0, // Default value
        materials_cost: 0, // Default value 
        total_cost: 0, // Default value
        created_at: '', // Default value
        updated_at: '', // Default value
        priority: 'MEDIUM' // Default value
      }));
      
      // Fetch projects associated with the subcontractor through work orders
      const projectIds = (workOrderData || [])
        .filter(wo => wo.project_id)
        .map(wo => wo.project_id);
        
      if (projectIds.length > 0) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('projectid, projectname, status')
          .in('projectid', projectIds);
          
        if (projectError) throw projectError;
        
        setProjects(projectData || []);
      } else {
        setProjects([]);
      }
      
      setWorkOrders(typedWorkOrders);
    } catch (err: any) {
      console.error('Error fetching subcontractor associated data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { workOrders, projects, loading, error, fetchAssociatedData };
};
