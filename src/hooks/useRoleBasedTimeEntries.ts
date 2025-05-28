import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  RoleBasedTimeEntry,
  AdminTimeEntryView,
  QuickLogFormData,
  UseRoleBasedTimeEntriesReturn,
  TimeEntryFilters,
} from '@/types/role-based-types';

export const useRoleBasedTimeEntries = (
  filters?: TimeEntryFilters
): UseRoleBasedTimeEntriesReturn => {
  const { user, employeeId, isAdmin, isFieldUser } = useAuth();
  const [timeEntries, setTimeEntries] = useState<RoleBasedTimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate overtime hours
  const calculateOvertime = (hoursWorked: number) => {
    const regular = Math.min(hoursWorked, 8);
    const overtime = Math.max(hoursWorked - 8, 0);
    return { regular, overtime };
  };

  // Calculate costs and billable amounts
  const calculateCosts = (
    hours: number,
    overtimeHours: number,
    employeeRate: number,
    billRate: number
  ) => {
    const regularCost = hours * employeeRate;
    const overtimeCost = overtimeHours * (employeeRate * 1.5);
    const totalCost = regularCost + overtimeCost;

    const regularBillable = hours * billRate;
    const overtimeBillable = overtimeHours * (billRate * 1.5);
    const totalBillable = regularBillable + overtimeBillable;

    return { totalCost, totalBillable };
  };

  // Fetch time entries based on role and filters
  const fetchTimeEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('time_entries').select(`
          *,
          employees!time_entries_employee_id_fkey (
            employee_id,
            first_name,
            last_name,
            hourly_rate,
            bill_rate,
            cost_rate
          )
        `);

      // Apply role-based filtering
      if (isFieldUser && employeeId) {
        // Field users can only see their own unprocessed entries
        query = query.eq('employee_id', employeeId).is('processed_at', null);
      }

      // Apply additional filters
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.processed !== undefined) {
        if (filters.processed) {
          query = query.not('processed_at', 'is', null);
        } else {
          query = query.is('processed_at', null);
        }
      }

      if (filters?.dateRange?.from) {
        query = query.gte('date_worked', filters.dateRange.from.toISOString().split('T')[0]);
      }

      if (filters?.dateRange?.to) {
        query = query.lte('date_worked', filters.dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error: fetchError } = await query.order('date_worked', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to include calculated fields and entity names
      const transformedEntries: RoleBasedTimeEntry[] = (data || []).map(entry => {
        const employee = entry.employees;
        const { regular, overtime } = calculateOvertime(entry.hours_worked);
        const { totalCost, totalBillable } = calculateCosts(
          regular,
          overtime,
          employee?.cost_rate || employee?.hourly_rate || 0,
          employee?.bill_rate || 0
        );

        // For now, use entity_id as entity_name to avoid async issues
        // TODO: Implement proper entity name fetching with caching
        const entityName = entry.entity_id;

        return {
          ...entry,
          hours_regular: (entry as any).hours_regular || regular,
          hours_ot: (entry as any).hours_ot || overtime,
          total_cost: (entry as any).total_cost || totalCost,
          total_billable: (entry as any).total_billable || totalBillable,
          employee_rate: employee?.hourly_rate || 0,
          cost_rate: employee?.cost_rate || employee?.hourly_rate || 0,
          bill_rate: employee?.bill_rate || 0,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
          entity_name: entityName,
          // Ensure required fields are present
          processed_at: (entry as any).processed_at || null,
          processed_by: (entry as any).processed_by || null,
          receipt_id: (entry as any).receipt_id || null,
        } as RoleBasedTimeEntry;
      });

      setTimeEntries(transformedEntries);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch time entries'));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isFieldUser, employeeId, filters]);

  // Create new time entry
  const createTimeEntry = async (data: QuickLogFormData): Promise<void> => {
    try {
      if (!employeeId) throw new Error('Employee ID not found');

      // Calculate hours worked
      const startTime = new Date(
        `${data.date_worked.toISOString().split('T')[0]}T${data.start_time}`
      );
      const endTime = new Date(`${data.date_worked.toISOString().split('T')[0]}T${data.end_time}`);
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      const { regular, overtime } = calculateOvertime(hoursWorked);

      // Get employee rates
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('hourly_rate, bill_rate, cost_rate')
        .eq('employee_id', employeeId)
        .single();

      if (empError) throw empError;

      const { totalCost, totalBillable } = calculateCosts(
        regular,
        overtime,
        employee?.cost_rate || employee?.hourly_rate || 0,
        employee?.bill_rate || 0
      );

      const { error: insertError } = await supabase.from('time_entries').insert({
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        date_worked: data.date_worked.toISOString().split('T')[0],
        start_time: data.start_time,
        end_time: data.end_time,
        hours_worked: hoursWorked,
        hours_regular: regular,
        hours_ot: overtime,
        employee_id: employeeId,
        employee_rate: employee?.hourly_rate || 0,
        cost_rate: employee?.cost_rate || employee?.hourly_rate || 0,
        bill_rate: employee?.bill_rate || 0,
        total_cost: totalCost,
        total_billable: totalBillable,
        notes: data.notes,
        has_receipts: data.has_receipts || false,
      });

      if (insertError) throw insertError;

      await fetchTimeEntries();
    } catch (err) {
      console.error('Error creating time entry:', err);
      throw err instanceof Error ? err : new Error('Failed to create time entry');
    }
  };

  // Update time entry
  const updateTimeEntry = async (id: string, data: Partial<RoleBasedTimeEntry>): Promise<void> => {
    try {
      // Recalculate if hours changed
      const updateData = { ...data };

      if (data.hours_worked) {
        const { regular, overtime } = calculateOvertime(data.hours_worked);
        updateData.hours_regular = regular;
        updateData.hours_ot = overtime;

        // Recalculate costs if we have rates
        if (data.employee_rate || data.cost_rate || data.bill_rate) {
          const { totalCost, totalBillable } = calculateCosts(
            regular,
            overtime,
            data.cost_rate || data.employee_rate || 0,
            data.bill_rate || 0
          );
          updateData.total_cost = totalCost;
          updateData.total_billable = totalBillable;
        }
      }

      const { error: updateError } = await supabase
        .from('time_entries')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchTimeEntries();
    } catch (err) {
      console.error('Error updating time entry:', err);
      throw err instanceof Error ? err : new Error('Failed to update time entry');
    }
  };

  // Process time entry (admin only)
  const processTimeEntry = async (id: string): Promise<void> => {
    try {
      if (!isAdmin) throw new Error('Only administrators can process time entries');

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          processed_at: new Date().toISOString(),
          processed_by: employeeId,
        } as any)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchTimeEntries();
    } catch (err) {
      console.error('Error processing time entry:', err);
      throw err instanceof Error ? err : new Error('Failed to process time entry');
    }
  };

  // Unprocess time entry (admin only)
  const unprocessTimeEntry = async (id: string): Promise<void> => {
    try {
      if (!isAdmin) throw new Error('Only administrators can unprocess time entries');

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          processed_at: null,
          processed_by: null,
        } as any)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchTimeEntries();
    } catch (err) {
      console.error('Error unprocessing time entry:', err);
      throw err instanceof Error ? err : new Error('Failed to unprocess time entry');
    }
  };

  // Refetch data
  const refetch = useCallback(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  // Initial fetch
  useEffect(() => {
    if (user && (employeeId || isAdmin)) {
      fetchTimeEntries();
    }
  }, [user, employeeId, isAdmin, fetchTimeEntries]);

  return {
    timeEntries,
    isLoading,
    error,
    refetch,
    createTimeEntry,
    updateTimeEntry,
    processTimeEntry,
    unprocessTimeEntry,
  };
};
