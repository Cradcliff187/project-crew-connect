import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/role-based-types';
import { Employee } from '@/types/common';
import { useEmployees } from '@/hooks/useEmployees';

export function useWorkOrderTimelogs(workOrderId: string) {
  const [timelogs, setTimelogs] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [totalLaborCost, setTotalLaborCost] = useState(0);

  const { employees, isLoadingEmployees } = useEmployees();

  const fetchTimelogs = async () => {
    if (!workOrderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching time logs for work order ID:', workOrderId);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*, employees(first_name, last_name, hourly_rate)')
        .eq('entity_type', 'work_order')
        .eq('entity_id', workOrderId)
        .order('date_worked', { ascending: false });

      if (error) throw error;

      console.log('Time logs data:', data);

      const typedTimelogs = (data || []).map(entry => {
        let entryCost = 0;
        const hours = entry.hours_worked || 0;
        const employeeRate = entry.employees?.hourly_rate || entry.employee_rate || 75;
        entryCost = hours * employeeRate;
        return {
          ...entry,
          entity_type: entry.entity_type as 'work_order' | 'project',
          employee_name: entry.employees
            ? `${entry.employees.first_name} ${entry.employees.last_name}`
            : 'Unassigned',
          employee_rate: employeeRate,
          total_cost: entry.total_cost || entryCost,
        };
      });

      setTimelogs(typedTimelogs);

      const hours = typedTimelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
      setTotalHours(hours);

      const cost = typedTimelogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      setTotalLaborCost(cost);

      if (typedTimelogs.length > 0) {
        const { data: workOrderData, error: fetchError } = await supabase
          .from('maintenance_work_orders')
          .select('actual_hours, total_cost')
          .eq('work_order_id', workOrderId)
          .single();

        if (fetchError) {
          console.error('Error fetching work order data:', fetchError);
        } else if (
          workOrderData &&
          (workOrderData.actual_hours !== hours || workOrderData.total_cost !== cost)
        ) {
          const { error: updateError } = await supabase
            .from('maintenance_work_orders')
            .update({
              actual_hours: hours,
              updated_at: new Date().toISOString(),
            })
            .eq('work_order_id', workOrderId);

          if (updateError) {
            console.error('Error updating work order hours:', updateError);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching timelogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time logs: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimelog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) {
      return;
    }

    try {
      const { error } = await supabase.from('time_entries').delete().eq('id', id);

      if (error) {
        throw error;
      }

      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('time_entry_id', id);

      if (expenseError) {
        console.error('Error deleting related expense:', expenseError);
      }

      toast({
        title: 'Time Log Deleted',
        description: 'The time log has been deleted successfully.',
      });

      fetchTimelogs();
    } catch (error: any) {
      console.error('Error deleting time log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time log: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (workOrderId) {
      fetchTimelogs();
    }
  }, [workOrderId]);

  const combinedIsLoading = loading || isLoadingEmployees;

  return {
    timelogs,
    loading: combinedIsLoading,
    employees,
    totalHours,
    totalLaborCost,
    fetchTimelogs,
    handleDeleteTimelog,
  };
}
