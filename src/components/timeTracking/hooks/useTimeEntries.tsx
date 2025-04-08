
import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';

export interface DateRange {
  start: Date;
  end: Date;
}

export function useTimeEntries() {
  // Use Monday as first day of week (value 1)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }), // Monday as first day
      end: endOfWeek(now, { weekStartsOn: 1 }),     // Sunday as last day
    };
  });
  
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format date range for display
  const formattedDateRange = useMemo(() => {
    return {
      start: format(dateRange.start, 'MMM d'),
      end: format(dateRange.end, 'MMM d'),
    };
  }, [dateRange]);
  
  // Fetch time entries for the selected date range
  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            email
          ),
          documents:time_entry_document_links!inner (
            document:documents (*)
          )
        `)
        .gte('date_worked', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('date_worked', format(dateRange.end, 'yyyy-MM-dd'))
        .order('date_worked', { ascending: false });
      
      if (error) throw error;
      
      // Process entries to include document and employee information
      const processedEntries = data.map(entry => {
        // Get employee name
        const employeeName = entry.employees ? 
          `${entry.employees.first_name} ${entry.employees.last_name}` : 
          'Unknown';
        
        // Format has_receipts property based on documents
        const hasReceipts = entry.documents && entry.documents.length > 0;
        
        return {
          ...entry,
          employee_name: employeeName,
          has_receipts: hasReceipts,
        };
      });
      
      setEntries(processedEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);
  
  // Refresh data
  const refreshEntries = useCallback(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);
  
  // Week navigation functions
  const goToNextWeek = useCallback(() => {
    setDateRange(prev => ({
      start: addWeeks(prev.start, 1),
      end: addWeeks(prev.end, 1)
    }));
  }, []);
  
  const goToPrevWeek = useCallback(() => {
    setDateRange(prev => ({
      start: addWeeks(prev.start, -1),
      end: addWeeks(prev.end, -1)
    }));
  }, []);
  
  const goToCurrentWeek = useCallback(() => {
    const now = new Date();
    setDateRange({
      start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(now, { weekStartsOn: 1 })
    });
  }, []);
  
  // Initialize data fetch
  useMemo(() => {
    fetchTimeEntries();
  }, [dateRange, fetchTimeEntries]);
  
  return {
    entries,
    loading,
    refreshEntries,
    dateRange,
    formattedDateRange,
    setDateRange,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek
  };
}
