
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeEntryFormValues } from './useTimeEntryForm';

interface WorkOrderOrProject {
  id: string;
  title: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  status?: string;
}

export function useEntityData(form: UseFormReturn<TimeEntryFormValues>) {
  const [workOrders, setWorkOrders] = useState<WorkOrderOrProject[]>([]);
  const [projects, setProjects] = useState<WorkOrderOrProject[]>([]);
  const [employees, setEmployees] = useState<{ employee_id: string, name: string }[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingEntities(true);
      
      try {
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, description, status, customer_id, location_id')
          .order('created_at', { ascending: false });
        
        if (workOrdersError) throw workOrdersError;
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, jobdescription, status, customerid, sitelocationaddress, sitelocationcity, sitelocationstate')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .eq('status', 'ACTIVE')
          .order('last_name', { ascending: true });
          
        if (employeesError) throw employeesError;
        
        // Format data
        const formattedWorkOrders = workOrdersData.map(wo => ({
          id: wo.work_order_id,
          title: wo.title,
          description: wo.description,
          status: wo.status,
          location: 'Location details will be fetched',
        }));
        
        const formattedProjects = projectsData.map(project => ({
          id: project.projectid,
          title: project.projectname,
          description: project.jobdescription,
          status: project.status,
          address: project.sitelocationaddress,
          city: project.sitelocationcity,
          state: project.sitelocationstate,
          location: [project.sitelocationcity, project.sitelocationstate].filter(Boolean).join(', '),
        }));
        
        const formattedEmployees = employeesData.map(emp => ({
          employee_id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`
        }));
        
        setWorkOrders(formattedWorkOrders);
        setProjects(formattedProjects);
        setEmployees(formattedEmployees);
        
        // Set default employee if there's any
        if (formattedEmployees.length > 0 && !form.getValues('employeeId')) {
          form.setValue('employeeId', formattedEmployees[0].employee_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error loading data',
          description: 'Could not load work orders and projects.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEntities(false);
      }
    };
    
    fetchData();
  }, [form]);
  
  const getSelectedEntityDetails = () => {
    if (!entityId) return null;
    
    if (entityType === 'work_order') {
      return workOrders.find(wo => wo.id === entityId);
    } else {
      return projects.find(proj => proj.id === entityId);
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
