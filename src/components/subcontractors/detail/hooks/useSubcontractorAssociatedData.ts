
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define clear, non-recursive types
interface WorkOrder {
  id: string;
  title: string;
  status: string;
  due_by_date?: string;
  progress: number;
  // Add other properties as needed but avoid circular references
}

interface Project {
  projectid: string;
  projectname: string;
  status: string;
  // Add other properties as needed but avoid circular references
}

export const useSubcontractorAssociatedData = (subcontractorId: string) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssociatedData = async () => {
      if (!subcontractorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch work orders associated with the subcontractor
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status, due_by_date, progress')
          .eq('assigned_to', subcontractorId);
          
        if (workOrderError) throw workOrderError;
        
        // Fetch projects associated with the subcontractor through work orders
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('projectid, projectname, status')
          .in('projectid', (workOrderData || []).map(wo => wo.project_id).filter(Boolean));
          
        if (projectError) throw projectError;
        
        setWorkOrders(workOrderData || []);
        setProjects(projectData || []);
      } catch (err: any) {
        console.error('Error fetching subcontractor associated data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssociatedData();
  }, [subcontractorId]);
  
  return { workOrders, projects, loading, error };
};
