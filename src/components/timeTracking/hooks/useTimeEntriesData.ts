
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeEntry } from '@/types/timeTracking';

export const useTimeEntriesData = (filterType: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTimeEntries = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          id,
          entity_type,
          entity_id,
          date_worked,
          start_time,
          end_time,
          hours_worked,
          employee_id,
          employee_rate,
          notes,
          has_receipts,
          total_cost,
          created_at,
          updated_at
        `)
        .order('date_worked', { ascending: false });
      
      if (filterType === 'work_orders') {
        query = query.eq('entity_type', 'work_order');
      } else if (filterType === 'projects') {
        query = query.eq('entity_type', 'project');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched time entries:', data);
      
      const enhancedEntries = await Promise.all((data || []).map(async (entry: any) => {
        let entityName = 'Unknown';
        let entityLocation = '';
        let employeeName = '';
        let vendorName = '';
        
        if (entry.entity_type === 'work_order') {
          const { data: workOrder } = await supabase
            .from('maintenance_work_orders')
            .select('title, location_id')
            .eq('work_order_id', entry.entity_id)
            .maybeSingle();
          
          if (workOrder) {
            entityName = workOrder.title;
            
            if (workOrder.location_id) {
              const { data: location } = await supabase
                .from('site_locations')
                .select('location_name, city, state')
                .eq('location_id', workOrder.location_id)
                .maybeSingle();
              
              if (location) {
                entityLocation = location.location_name || 
                  [location.city, location.state].filter(Boolean).join(', ');
              }
            }
          }
        } else {
          const { data: project } = await supabase
            .from('projects')
            .select('projectname, sitelocationcity, sitelocationstate')
            .eq('projectid', entry.entity_id)
            .maybeSingle();
          
          if (project) {
            entityName = project.projectname || `Project ${entry.entity_id}`;
            entityLocation = [project.sitelocationcity, project.sitelocationstate]
              .filter(Boolean).join(', ');
          }
        }
        
        if (entry.employee_id) {
          const { data: employee } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('employee_id', entry.employee_id)
            .maybeSingle();
          
          if (employee) {
            employeeName = `${employee.first_name} ${employee.last_name}`;
          }
        }
        
        const cost = entry.total_cost || (entry.hours_worked && entry.employee_rate 
          ? entry.hours_worked * entry.employee_rate 
          : entry.hours_worked * 75);
        
        return {
          ...entry,
          entity_name: entityName,
          entity_location: entityLocation || undefined,
          employee_name: employeeName,
          vendor_name: vendorName,
          total_cost: cost
        };
      }));
      
      setTimeEntries(enhancedEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);
  
  const handleDeleteEntry = async (id: string) => {
    try {
      const { data: entry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      if (entry.entity_type === 'work_order') {
        const { error: workOrderLogError } = await supabase
          .from('work_order_time_logs')
          .delete()
          .eq('work_order_id', entry.entity_id)
          .eq('hours_worked', entry.hours_worked)
          .eq('employee_id', entry.employee_id || '')
          .eq('work_date', entry.date_worked);
          
        if (workOrderLogError) {
          console.warn('Warning: Could not clean up associated work order time log:', workOrderLogError);
        }
      }
      
      const { error: receiptDeleteError } = await supabase
        .from('time_entry_receipts')
        .delete()
        .eq('time_entry_id', id);
        
      if (receiptDeleteError) {
        console.warn('Warning: Could not delete associated receipts:', receiptDeleteError);
      }
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been successfully deleted.',
      });
      
      fetchTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry.',
        variant: 'destructive',
      });
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);
  
  return {
    timeEntries,
    isLoading,
    fetchTimeEntries,
    handleDeleteEntry
  };
};
