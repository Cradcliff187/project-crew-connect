
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Plus, Save, Trash2, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkOrderTimelog } from '@/types/workOrder';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkOrderTimelogsProps {
  workOrderId: string;
}

const WorkOrderTimelogs = ({ workOrderId }: WorkOrderTimelogsProps) => {
  const [timelogs, setTimelogs] = useState<WorkOrderTimelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<{ employee_id: string, name: string }[]>([]);
  
  // Form state
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const fetchTimelogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_time_logs')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('work_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
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
      
      // Set the first employee as selected by default if available
      if (formattedEmployees.length > 0 && !selectedEmployee) {
        setSelectedEmployee(formattedEmployees[0].employee_id);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  useEffect(() => {
    fetchTimelogs();
    fetchEmployees();
  }, [workOrderId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || parseFloat(hours) <= 0) {
      toast({
        title: 'Invalid Hours',
        description: 'Please enter a valid number of hours.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_order_time_logs')
        .insert({
          work_order_id: workOrderId,
          employee_id: selectedEmployee,
          hours_worked: parseFloat(hours),
          notes,
          work_date: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Time Logged',
        description: 'Time has been logged successfully.',
      });
      
      // Reset form
      setHours('');
      setNotes('');
      
      // Refresh time logs
      fetchTimelogs();
    } catch (error: any) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error',
        description: 'Failed to log time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('work_order_time_logs')
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
    } catch (error: any) {
      console.error('Error deleting time log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time log. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Find employee name by ID
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Unassigned';
    const employee = employees.find(e => e.employee_id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="hours" className="text-sm font-medium">
                  Hours Worked *
                </label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  placeholder="0.00"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="employee" className="text-sm font-medium">
                  Employee
                </label>
                <Select 
                  value={selectedEmployee || undefined} 
                  onValueChange={(value) => setSelectedEmployee(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Enter notes about the work performed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={submitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : 'Log Time'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Time History</h3>
        
        {loading ? (
          <div className="text-center py-4">Loading time logs...</div>
        ) : timelogs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No time has been logged for this work order yet.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timelogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.work_date)}</TableCell>
                    <TableCell>{getEmployeeName(log.employee_id)}</TableCell>
                    <TableCell>{log.hours_worked}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(log.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderTimelogs;
