
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';

export function useTimeEntries(selectedDate: Date) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTimeEntries = async () => {
    setIsLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch time entries for the selected date
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('date_worked', formattedDate)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      // If no entries, return empty array
      if (!data || data.length === 0) {
        setTimeEntries([]);
        return;
      }
      
      // Enhance the entries with additional entity data
      const enhancedEntries = await Promise.all(data.map(async (entry: TimeEntry) => {
        let entityName = '';
        let entityLocation = '';
        
        // Get employee name if employeeId exists
        let employeeName = '';
        if (entry.employee_id) {
          const { data: empData } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('employee_id', entry.employee_id)
            .maybeSingle();
            
          if (empData) {
            employeeName = `${empData.first_name} ${empData.last_name}`;
          }
        }
        
        // Get entity details based on type
        if (entry.entity_type === 'work_order') {
          const { data: woData } = await supabase
            .from('maintenance_work_orders')
            .select('title, location_id')
            .eq('work_order_id', entry.entity_id)
            .maybeSingle();
            
          if (woData) {
            entityName = woData.title;
            
            // Get location if available
            if (woData.location_id) {
              const { data: locData } = await supabase
                .from('site_locations')
                .select('location_name, address, city, state')
                .eq('location_id', woData.location_id)
                .maybeSingle();
                
              if (locData) {
                entityLocation = locData.location_name || `${locData.address}, ${locData.city}, ${locData.state}`;
              }
            }
          }
        } else if (entry.entity_type === 'project') {
          const { data: projData } = await supabase
            .from('projects')
            .select('projectname, sitelocationaddress, sitelocationcity, sitelocationstate')
            .eq('projectid', entry.entity_id)
            .maybeSingle();
            
          if (projData) {
            entityName = projData.projectname;
            
            if (projData.sitelocationaddress) {
              entityLocation = `${projData.sitelocationaddress}, ${projData.sitelocationcity || ''}, ${projData.sitelocationstate || ''}`;
            }
          }
        }
        
        return {
          ...entry,
          entity_name: entityName,
          entity_location: entityLocation,
          employee_name: employeeName
        };
      }));
      
      setTimeEntries(enhancedEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      setTimeEntries([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Re-fetch entries when date changes
  useEffect(() => {
    fetchTimeEntries();
  }, [selectedDate]);
  
  return {
    timeEntries,
    isLoading,
    refetch: fetchTimeEntries
  };
}
