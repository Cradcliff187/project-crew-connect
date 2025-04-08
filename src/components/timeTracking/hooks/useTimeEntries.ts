
import { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';

// Default date range - current week starting from Monday
const getDefaultDateRange = () => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  
  return {
    startDate: startOfCurrentWeek,
    endDate: endOfCurrentWeek
  };
};

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function useTimeEntries() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Function to fetch time entries for the specified date range
  const fetchEntriesForDateRange = useCallback(async (range: DateRange) => {
    setLoading(true);
    
    try {
      const start = format(range.startDate, 'yyyy-MM-dd');
      const end = format(range.endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching time entries from ${start} to ${end}`);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, employees(first_name, last_name, hourly_rate)')
        .gte('date_worked', start)
        .lte('date_worked', end)
        .order('date_worked', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process the data to include employee names and ensure types
      const enhancedData = (data || []).map(entry => {
        // Get employee name from joined table if available
        let employeeName = "Unassigned";
        if (entry.employees) {
          employeeName = `${entry.employees.first_name} ${entry.employees.last_name}`;
        }
        
        // Format the entity type to match our TimeEntry type
        return {
          ...entry,
          entity_type: entry.entity_type as 'work_order' | 'project',
          employee_name: employeeName
        };
      });
      
      setEntries(enhancedData);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Function to refresh entries using the current date range
  const refreshEntries = useCallback(() => {
    fetchEntriesForDateRange(dateRange);
  }, [dateRange, fetchEntriesForDateRange]);
  
  // Navigation functions
  const goToNextWeek = useCallback(() => {
    const newStartDate = addWeeks(dateRange.startDate, 1);
    const newEndDate = addWeeks(dateRange.endDate, 1);
    const newRange = { startDate: newStartDate, endDate: newEndDate };
    setDateRange(newRange);
    fetchEntriesForDateRange(newRange);
  }, [dateRange, fetchEntriesForDateRange]);
  
  const goToPrevWeek = useCallback(() => {
    const newStartDate = subWeeks(dateRange.startDate, 1);
    const newEndDate = subWeeks(dateRange.endDate, 1);
    const newRange = { startDate: newStartDate, endDate: newEndDate };
    setDateRange(newRange);
    fetchEntriesForDateRange(newRange);
  }, [dateRange, fetchEntriesForDateRange]);
  
  const goToCurrentWeek = useCallback(() => {
    const newRange = getDefaultDateRange();
    setDateRange(newRange);
    fetchEntriesForDateRange(newRange);
  }, [fetchEntriesForDateRange]);
  
  // Effect to fetch data when the date range changes
  useEffect(() => {
    fetchEntriesForDateRange(dateRange);
  }, [dateRange, fetchEntriesForDateRange]);
  
  return {
    entries,
    loading,
    refreshEntries,
    dateRange,
    setDateRange,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek
  };
}
