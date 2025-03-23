
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';
import { TimelogsInfoSection } from './timelogs/components';

interface WorkOrderTimelogsProps {
  workOrderId: string;
  onTimeLogAdded?: () => void;
}

const WorkOrderTimelogs = ({ workOrderId, onTimeLogAdded }: WorkOrderTimelogsProps) => {
  const [timelogs, setTimelogs] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<{ employee_id: string, name: string }[]>([]);
  
  const fetchTimelogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching time logs for work order ID:', workOrderId);
      
      // Get time entries for this work order, ordered by most recent first
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('entity_type', 'work_order')
        .eq('entity_id', workOrderId)
        .order('date_worked', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Time logs data:', data);
      setTimelogs(data || []);
    } catch (error: any) {
      console.error('Error fetching timelogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time logs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name')
        .eq('status', 'ACTIVE');
      
      if (error) {
        throw error;
      }
      
      const formattedEmployees = (data || []).map(emp => ({
        employee_id: emp.employee_id,
        name: `${emp.first_name} ${emp.last_name}`
      }));
      
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  useEffect(() => {
    if (workOrderId) {
      fetchTimelogs();
      fetchEmployees();
    }
  }, [workOrderId]);
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Time Log Deleted',
        description: 'The time log has been deleted successfully.',
      });
      
      // Refresh time logs
      fetchTimelogs();

      // Notify parent component
      if (onTimeLogAdded) {
        onTimeLogAdded();
      }
    } catch (error: any) {
      console.error('Error deleting time log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time log. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <TimelogsInfoSection
      timelogs={timelogs}
      loading={loading}
      employees={employees}
      workOrderId={workOrderId}
      onDelete={handleDelete}
      onTimeLogAdded={() => {
        fetchTimelogs();
        if (onTimeLogAdded) onTimeLogAdded();
      }}
    />
  );
};

export default WorkOrderTimelogs;
