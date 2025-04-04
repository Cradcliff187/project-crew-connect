
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryFormValues } from './useTimeEntryForm';

interface Entity {
  id: string;
  name: string;
}

interface Employee {
  employee_id: string;
  name: string;
}

export const useEntityData = (form: UseFormReturn<TimeEntryFormValues>) => {
  const [workOrders, setWorkOrders] = useState<Entity[]>([]);
  const [projects, setProjects] = useState<Entity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  
  // Fetch work orders and projects
  useEffect(() => {
    const fetchEntities = async () => {
      setIsLoadingEntities(true);
      
      try {
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (workOrdersError) throw workOrdersError;
        
        setWorkOrders(
          (workOrdersData || []).map(wo => ({
            id: wo.work_order_id,
            name: wo.title
          }))
        );
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('createdon', { ascending: false })
          .limit(100);
          
        if (projectsError) throw projectsError;
        
        setProjects(
          (projectsData || []).map(p => ({
            id: p.projectid,
            name: p.projectname || p.projectid
          }))
        );
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .eq('status', 'ACTIVE')
          .order('last_name', { ascending: true });
          
        if (employeesError) throw employeesError;
        
        setEmployees(
          (employeesData || []).map(e => ({
            employee_id: e.employee_id,
            name: `${e.first_name} ${e.last_name}`,
            hourly_rate: e.hourly_rate
          }))
        );
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
      const selectedWorkOrder = workOrders.find(wo => wo.id === entityId);
      if (selectedWorkOrder) {
        return {
          name: selectedWorkOrder.name,
          type: 'work_order'
        };
      }
    } else if (entityType === 'project') {
      const selectedProject = projects.find(p => p.id === entityId);
      if (selectedProject) {
        return {
          name: selectedProject.name,
          type: 'project'
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
};
