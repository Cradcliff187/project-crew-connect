
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryFormValues } from './useTimeEntryForm';

export function useEntityData(form: UseFormReturn<any>) {
  const [workOrders, setWorkOrders] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ employee_id: string; name: string }[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  
  // Watch the entity type to reload data when it changes
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  
  // Fetch work orders and projects
  useEffect(() => {
    const fetchEntities = async () => {
      setIsLoadingEntities(true);
      
      try {
        // Fetch work orders
        const { data: workOrdersData } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });
          
        if (workOrdersData) {
          setWorkOrders(
            workOrdersData.map(wo => ({
              id: wo.work_order_id,
              name: wo.title || `Work Order ${wo.work_order_id.substring(0, 8)}` 
            }))
          );
        }
        
        // Fetch projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });
          
        if (projectsData) {
          setProjects(
            projectsData.map(p => ({
              id: p.projectid,
              name: p.projectname || `Project ${p.projectid.substring(0, 8)}`
            }))
          );
        }
        
        // Fetch employees
        const { data: employeesData } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name')
          .eq('status', 'ACTIVE')
          .order('first_name');
          
        if (employeesData) {
          setEmployees(
            employeesData.map(e => ({
              employee_id: e.employee_id,
              name: `${e.first_name} ${e.last_name}`
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
      } finally {
        setIsLoadingEntities(false);
      }
    };
    
    fetchEntities();
  }, []);
  
  // Get selected entity details
  const getSelectedEntityDetails = () => {
    if (!entityId) return null;
    
    if (entityType === 'work_order') {
      const workOrder = workOrders.find(wo => wo.id === entityId);
      if (workOrder) {
        return {
          id: workOrder.id,
          name: workOrder.name,
          type: 'work_order' as const
        };
      }
    } else if (entityType === 'project') {
      const project = projects.find(p => p.id === entityId);
      if (project) {
        return {
          id: project.id,
          name: project.name,
          type: 'project' as const
        };
      }
    }
    
    return null;
  };
  
  return {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  };
}
