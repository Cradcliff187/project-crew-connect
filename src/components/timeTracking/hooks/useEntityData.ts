
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

interface Entity {
  id: string;
  name: string;
}

interface Employee {
  employee_id: string;
  name: string;
  hourly_rate?: number;
}

// Define a more generic form structure that works with multiple components
export interface TimeEntryFormBase {
  entityType: 'work_order' | 'project';
  entityId: string;
}

export function useEntityData(form: UseFormReturn<any>) {
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
        console.log('Fetching work orders and projects');
        
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (workOrdersError) {
          console.error('Error fetching work orders:', workOrdersError);
          throw workOrdersError;
        }
        
        const formattedWorkOrders = (workOrdersData || []).map(wo => ({
          id: wo.work_order_id,
          name: wo.title || `Work Order ${wo.work_order_id.substring(0, 8)}`
        }));
        
        console.log('Fetched work orders:', formattedWorkOrders.length);
        setWorkOrders(formattedWorkOrders);
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          throw projectsError;
        }
        
        const formattedProjects = (projectsData || []).map(p => ({
          id: p.projectid,
          name: p.projectname || p.projectid
        }));
        
        console.log('Fetched projects:', formattedProjects.length);
        setProjects(formattedProjects);
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .eq('status', 'ACTIVE')
          .order('last_name', { ascending: true });
          
        if (employeesError) {
          console.error('Error fetching employees:', employeesError);
          throw employeesError;
        }
        
        const formattedEmployees = (employeesData || []).map(e => ({
          employee_id: e.employee_id,
          name: `${e.first_name} ${e.last_name}`,
          hourly_rate: e.hourly_rate
        }));
        
        console.log('Fetched employees:', formattedEmployees.length);
        setEmployees(formattedEmployees);
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
          type: 'work_order' as const,
          location: undefined
        };
      }
    } else if (entityType === 'project') {
      const selectedProject = projects.find(p => p.id === entityId);
      if (selectedProject) {
        return {
          name: selectedProject.name,
          type: 'project' as const,
          location: undefined
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
