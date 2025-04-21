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
    endDate: endOfCurrentWeek,
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

      console.log(`Fetching time entries (using IMPLICIT JOIN) from ${start} to ${end}`);

      // Revert to using the implicit join syntax (like the detail hooks)
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, employees(first_name, last_name, hourly_rate)') // Implicit join
        .gte('date_worked', start)
        .lte('date_worked', end)
        .order('date_worked', { ascending: false });

      if (error) {
        console.error('Supabase error fetching time entries:', error);
        throw error;
      }

      // Restore standard mapping logic
      const enhancedData = (data || []).map(entry => {
        let employeeName = 'Unassigned';
        const empData = entry.employees as any;
        if (empData && empData.first_name && empData.last_name) {
          employeeName = `${empData.first_name} ${empData.last_name}`;
        } else {
          // REMOVE this empty block
          // if (entry.employee_id) {
          // }
        }

        // Ensure the final object matches the TimeEntry type
        const timeEntryResult: TimeEntry = {
          ...entry,
          entity_type: entry.entity_type as 'work_order' | 'project',
          employee_name: employeeName,
        };
        // Remove the nested employees field AFTER spreading
        delete (timeEntryResult as any).employees;

        return timeEntryResult;
      });

      setEntries(enhancedData);
    } catch (error) {
      console.error('Error fetching time entries catch block:', error);
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
    goToCurrentWeek,
  };
}
