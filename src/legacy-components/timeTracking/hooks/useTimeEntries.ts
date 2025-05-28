import { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Function to fetch time entries for the specified date range
  const fetchEntriesForDateRange = useCallback(async (range: DateRange) => {
    setLoading(true);
    try {
      const start = format(range.startDate, 'yyyy-MM-dd');
      const end = format(range.endDate, 'yyyy-MM-dd');

      console.log(`Fetching time entries from ${start} to ${end}`);

      const { data: timeEntryData, error: timeEntryError } = await supabase
        .from('time_entries')
        .select('*, employees(first_name, last_name, hourly_rate)')
        .gte('date_worked', start)
        .lte('date_worked', end)
        .order('date_worked', { ascending: false });

      if (timeEntryError) {
        console.error('Supabase error fetching time entries:', timeEntryError);
        throw timeEntryError;
      }

      const entriesData = timeEntryData || [];
      const projectIds = entriesData
        .filter(e => e.entity_type === 'project' && e.entity_id)
        .map(e => e.entity_id);
      const workOrderIds = entriesData
        .filter(e => e.entity_type === 'work_order' && e.entity_id)
        .map(e => e.entity_id);

      // Fetch entity names in parallel
      const [projectRes, woRes] = await Promise.all([
        projectIds.length > 0
          ? supabase.from('projects').select('projectid, projectname').in('projectid', projectIds)
          : Promise.resolve({ data: [], error: null }),
        workOrderIds.length > 0
          ? supabase
              .from('maintenance_work_orders')
              .select('work_order_id, title')
              .in('work_order_id', workOrderIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (projectRes.error) console.error('Error fetching project names:', projectRes.error);
      if (woRes.error) console.error('Error fetching work order names:', woRes.error);

      // Ensure data arrays exist before mapping for Map constructor
      const projectData = projectRes.data || [];
      const woData = woRes.data || [];

      const projectNameMap = new Map(
        projectData.map(p => [p.projectid, p.projectname || `Project ${p.projectid}`])
      );
      const woNameMap = new Map(
        woData.map(wo => [wo.work_order_id, wo.title || `Work Order ${wo.work_order_id}`])
      );

      // Restore standard mapping logic, adding entity_name
      const enhancedData = entriesData.map(entry => {
        let employeeName = 'Unassigned';
        // Use optional chaining and nullish coalescing for safer access
        const empData = entry.employees as { first_name?: string; last_name?: string } | null;
        if (empData?.first_name && empData?.last_name) {
          employeeName = `${empData.first_name} ${empData.last_name}`;
        }

        // Add entity name based on type and lookup maps
        let entity_name = 'Unknown Entity';
        if (entry.entity_type === 'project' && entry.entity_id) {
          entity_name = projectNameMap.get(entry.entity_id) || `Project ${entry.entity_id}`;
        } else if (entry.entity_type === 'work_order' && entry.entity_id) {
          entity_name = woNameMap.get(entry.entity_id) || `Work Order ${entry.entity_id}`;
        }

        const timeEntryResult: TimeEntry = {
          ...entry,
          // Explicitly cast potentially unknown fields if necessary, or adjust TimeEntry type
          id: entry.id as string,
          hours_worked: entry.hours_worked as number,
          notes: entry.notes as string,
          has_receipts: entry.has_receipts as boolean,
          created_at: entry.created_at as string,
          // Map other fields explicitly if types mismatch
          entity_type: entry.entity_type as 'work_order' | 'project',
          employee_name: employeeName,
          entity_name: entity_name, // Add the fetched name
        };
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

  // --- CRUD Functions ---

  const handleDeleteTimeEntry = useCallback(
    async (entryToDelete: TimeEntry) => {
      if (!entryToDelete || !entryToDelete.id) {
        console.error('Invalid entry provided for deletion');
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete this time entry for ${entryToDelete.employee_name || 'employee'} on ${format(new Date(entryToDelete.date_worked), 'P')}? This may also delete the associated labor expense.`
      );

      if (!confirmed) return;

      setLoading(true);
      try {
        // 1. Delete associated expense first (if exists)
        const { error: expenseError } = await supabase
          .from('expenses')
          .delete()
          .eq('time_entry_id', entryToDelete.id);

        if (expenseError) {
          // Log error but proceed, maybe the expense didn't exist
          console.warn('Error deleting associated expense (might not exist):', expenseError);
        }

        // 2. Delete the time entry
        const { error: timeEntryError } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entryToDelete.id);

        if (timeEntryError) {
          throw timeEntryError; // Throw if deleting the main entry fails
        }

        toast({
          title: 'Success',
          description: 'Time entry deleted.',
        });

        // Invalidate and actively refetch queries in the background
        const projectId = entryToDelete.entity_id;
        await queryClient.refetchQueries({
          queryKey: ['project-budget-summary', projectId],
          exact: true,
        });
        await queryClient.refetchQueries({
          queryKey: ['project-detail', projectId],
          exact: true,
        });
        await queryClient.refetchQueries({
          queryKey: ['project-expenses', projectId],
          exact: true,
        });

        refreshEntries(); // Refresh the time entry list itself
      } catch (error: any) {
        console.error('Error deleting time entry:', error);
        toast({
          title: 'Error',
          description: `Failed to delete time entry: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [refreshEntries, queryClient]
  );

  // Function to set the entry being edited (triggering UI change in parent)
  const handleEditTimeEntry = useCallback((entryToEdit: TimeEntry) => {
    setEditingEntry(entryToEdit);
  }, []);

  // Function to clear the editing state (called by parent after save/cancel)
  const clearEditingEntry = useCallback(() => {
    setEditingEntry(null);
  }, []);

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
    handleDeleteTimeEntry,
    handleEditTimeEntry,
    editingEntry,
    clearEditingEntry,
  };
}
