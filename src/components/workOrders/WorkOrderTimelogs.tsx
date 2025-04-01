
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { TimelogsInfoSection } from './timelogs/components';

interface WorkOrderTimelogsProps {
  workOrderId: string;
  onTimeLogAdded: () => void;
}

const WorkOrderTimelogs = ({ workOrderId, onTimeLogAdded }: WorkOrderTimelogsProps) => {
  const [timelogs, setTimelogs] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<{ employee_id: string; name: string }[]>([]);
  
  // Fetch time logs for this work order
  const fetchTimelogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('entity_type', 'work_order')
        .eq('entity_id', workOrderId)
        .order('date_worked', { ascending: false });
      
      if (error) throw error;
      
      setTimelogs(data || []);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch employees for the selector
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name')
        .eq('status', 'ACTIVE');
      
      if (error) throw error;
      
      setEmployees(
        (data || []).map(emp => ({
          employee_id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`
        }))
      );
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  // Delete a time log
  const handleDeleteTimelog = async (timelogId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('time_entry_id', timelogId);
      
      if (error) throw error;
      
      // Refresh the list
      fetchTimelogs();
      
      // Call the callback to update parent components
      onTimeLogAdded();
      
      toast({
        title: 'Time Entry Deleted',
        description: 'The time entry has been removed.',
      });
    } catch (error) {
      console.error('Error deleting time log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry',
        variant: 'destructive',
      });
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchTimelogs();
    fetchEmployees();
  }, [workOrderId]);
  
  // Handle when a new time log is added
  const handleTimeLogAdded = () => {
    fetchTimelogs();
    onTimeLogAdded();
  };
  
  return (
    <div className="space-y-6">
      <TimelogsInfoSection
        timelogs={timelogs}
        loading={loading}
        employees={employees}
        workOrderId={workOrderId}
        onDelete={handleDeleteTimelog}
        onTimeLogAdded={handleTimeLogAdded}
      />
    </div>
  );
};

export default WorkOrderTimelogs;
