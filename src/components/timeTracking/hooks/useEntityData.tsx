
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Entity, Employee, WorkOrderOrProject } from '@/types/timeTracking';

export function useEntityData() {
  const [workOrders, setWorkOrders] = useState<WorkOrderOrProject[]>([]);
  const [projects, setProjects] = useState<WorkOrderOrProject[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntities() {
      setIsLoadingEntities(true);
      setError(null);
      
      try {
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('work_orders')
          .select('id, title, status')
          .order('title');
          
        if (workOrdersError) throw workOrdersError;
        
        // Map to include name property for compatibility
        const mappedWorkOrders = workOrdersData.map(wo => ({
          ...wo,
          name: wo.title // Add name property that maps to title
        }));
        
        setWorkOrders(mappedWorkOrders);
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title, status')
          .order('title');
          
        if (projectsError) throw projectsError;
        
        // Map to include name property for compatibility
        const mappedProjects = projectsData.map(project => ({
          ...project,
          name: project.title // Add name property that maps to title
        }));
        
        setProjects(mappedProjects);
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .order('last_name');
          
        if (employeesError) throw employeesError;
        
        const formattedEmployees = employeesData.map(emp => ({
          employee_id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          hourly_rate: emp.hourly_rate
        }));
        
        setEmployees(formattedEmployees);
      } catch (err: any) {
        console.error('Error fetching entities:', err);
        setError(err.message);
      } finally {
        setIsLoadingEntities(false);
      }
    }
    
    fetchEntities();
  }, []);
  
  // Function to get entity details by ID
  const getEntityDetails = (entityType: 'work_order' | 'project', entityId: string) => {
    if (entityType === 'work_order') {
      return workOrders.find(wo => wo.id === entityId);
    } else {
      return projects.find(project => project.id === entityId);
    }
  };

  return {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    error,
    getEntityDetails
  };
}
