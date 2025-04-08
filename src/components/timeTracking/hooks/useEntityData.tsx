
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryFormValues } from './useTimeEntryForm';
import { toast } from '@/hooks/use-toast';

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
        console.log('Starting to fetch entities for time tracking...');
        
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('created_at', { ascending: false });
          
        if (workOrdersError) {
          console.error('Error fetching work orders:', workOrdersError);
          throw workOrdersError;
        }
        
        console.log('Work orders fetched:', workOrdersData?.length || 0);
        
        if (workOrdersData && workOrdersData.length > 0) {
          const formattedWorkOrders = workOrdersData.map(wo => ({
            id: wo.work_order_id,
            name: wo.title || `Work Order ${wo.work_order_id.substring(0, 8)}`
          }));
          setWorkOrders(formattedWorkOrders);
          console.log('Work orders processed:', formattedWorkOrders);
        } else {
          console.log('No work orders returned from database');
          setWorkOrders([]);
        }
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, status')
          .order('created_at', { ascending: false });
          
        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          throw projectsError;
        }
        
        console.log('Projects fetched:', projectsData?.length || 0);
        
        if (projectsData && projectsData.length > 0) {
          const formattedProjects = projectsData.map(p => ({
            id: p.projectid,
            name: p.projectname || p.projectid,
            status: p.status
          }));
          setProjects(formattedProjects);
          console.log('Projects processed:', formattedProjects);
        } else {
          console.log('No projects returned from database');
          setProjects([]);
        }
        
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
        
        if (employeesData) {
          setEmployees(
            employeesData.map(e => ({
              employee_id: e.employee_id,
              name: `${e.first_name} ${e.last_name}`,
              hourly_rate: e.hourly_rate
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
        toast({
          title: 'Failed to load projects and work orders',
          description: 'Please try again or contact support',
          variant: 'destructive'
        });
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
