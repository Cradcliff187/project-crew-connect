
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Entity, Employee, EntityDetails } from '@/types/timeTracking';

export function useEntityData(entityId?: string) {
  const [workOrders, setWorkOrders] = useState<Entity[]>([]);
  const [projects, setProjects] = useState<Entity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  
  useEffect(() => {
    async function fetchEntities() {
      setIsLoadingEntities(true);
      try {
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('created_at', { ascending: false });
          
        if (workOrdersError) throw workOrdersError;
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('created_at', { ascending: false });
          
        if (projectsError) throw projectsError;
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .eq('status', 'ACTIVE')
          .order('last_name', { ascending: true });
          
        if (employeesError) throw employeesError;
        
        // Format work orders
        const formattedWorkOrders: Entity[] = workOrdersData.map(wo => ({
          id: wo.work_order_id,
          name: wo.title,
          status: 'active'
        }));
        
        // Format projects
        const formattedProjects: Entity[] = projectsData.map(project => ({
          id: project.projectid,
          name: project.projectname,
          status: 'active'
        }));
        
        // Format employees
        const formattedEmployees: Employee[] = employeesData.map(emp => ({
          employee_id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          hourly_rate: emp.hourly_rate
        }));
        
        setWorkOrders(formattedWorkOrders);
        setProjects(formattedProjects);
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error('Error fetching entities:', error);
      } finally {
        setIsLoadingEntities(false);
      }
    }
    
    fetchEntities();
  }, []);
  
  const getSelectedEntityDetails = (id?: string, type?: 'work_order' | 'project'): EntityDetails => {
    const entityToLookFor = id || entityId;
    
    if (!entityToLookFor) {
      return { name: '', type: 'work_order' };
    }
    
    if (type === 'work_order' || (!type && workOrders.find(wo => wo.id === entityToLookFor))) {
      const workOrder = workOrders.find(wo => wo.id === entityToLookFor);
      return {
        name: workOrder?.name || '',
        type: 'work_order',
      };
    } else {
      const project = projects.find(p => p.id === entityToLookFor);
      return {
        name: project?.name || '',
        type: 'project',
      };
    }
  };
  
  return {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  };
}
