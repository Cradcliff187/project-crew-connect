
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseFormReturn } from 'react-hook-form';
import { TimeEntryFormValues } from './useTimeEntryForm';

export function useEntityData(form: UseFormReturn<TimeEntryFormValues>) {
  const [workOrders, setWorkOrders] = useState<{id: string; title: string; location?: string}[]>([]);
  const [projects, setProjects] = useState<{id: string; title: string; location?: string}[]>([]);
  const [employees, setEmployees] = useState<{employee_id: string; name: string}[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  
  // Watch the entity type to fetch appropriate data
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  
  // Fetch work orders
  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select(`
          work_order_id,
          title,
          description,
          status
        `)
        .in('status', ['NEW', 'IN_PROGRESS'])
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setWorkOrders(data.map(wo => ({
        id: wo.work_order_id,
        title: wo.title,
        description: wo.description
      })));
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };
  
  // Fetch projects
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          projectid,
          projectname,
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate
        `)
        .in('status', ['active', 'in progress', 'in-progress', 'pending'])
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setProjects(data.map(project => ({
        id: project.projectid,
        title: project.projectname,
        location: [
          project.sitelocationaddress,
          project.sitelocationcity,
          project.sitelocationstate
        ].filter(Boolean).join(', ')
      })));
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  
  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          employee_id,
          first_name,
          last_name,
          hourly_rate
        `)
        .eq('status', 'ACTIVE')
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      
      setEmployees(data.map(employee => ({
        employee_id: employee.employee_id,
        name: `${employee.first_name} ${employee.last_name}`
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  // Get detailed information about the selected entity
  const getSelectedEntityDetails = () => {
    if (!entityId) return null;
    
    if (entityType === 'work_order') {
      return workOrders.find(wo => wo.id === entityId);
    } else {
      return projects.find(p => p.id === entityId);
    }
  };
  
  // Load all entities
  useEffect(() => {
    const loadEntities = async () => {
      setIsLoadingEntities(true);
      await Promise.all([
        fetchWorkOrders(),
        fetchProjects(),
        fetchEmployees()
      ]);
      setIsLoadingEntities(false);
    };
    
    loadEntities();
  }, []);
  
  return {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  };
}
