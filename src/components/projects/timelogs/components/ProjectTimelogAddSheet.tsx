import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatePicker } from '@/components/ui/date-picker';
import { calculateHours } from '@/utils/time/timeUtils';
import { Employee } from '@/types/common';

interface ProjectTimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  employees: Employee[];
  onSuccess: () => void;
}

const ProjectTimelogAddSheet: React.FC<ProjectTimelogAddSheetProps> = ({
  open,
  onOpenChange,
  projectId,
  employees,
  onSuccess,
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getCalculatedHours = () => {
    return calculateHours(startTime, endTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast({
        title: 'Missing data',
        description: 'Please select an employee',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Missing data',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }

    const hoursWorked = getCalculatedHours();
    if (hoursWorked <= 0) {
      toast({
        title: 'Invalid time',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get employee rate
      const { data: employeeData } = await supabase
        .from('employees')
        .select('hourly_rate')
        .eq('employee_id', employeeId)
        .single();

      const hourlyRate = employeeData?.hourly_rate || 75; // Default to $75/hr if not found

      // Insert time entry
      const { data, error } = await supabase.from('time_entries').insert({
        entity_type: 'project',
        entity_id: projectId,
        employee_id: employeeId,
        date_worked: date,
        start_time: startTime,
        end_time: endTime,
        hours_worked: hoursWorked,
        notes: notes,
        has_receipts: hasReceipt,
        created_at: new Date().toISOString(),
        employee_rate: hourlyRate,
        total_cost: hourlyRate * hoursWorked,
      });

      if (error) throw error;

      toast({
        title: 'Time entry added',
        description: 'Time has been logged successfully',
      });

      // Reset form
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('17:00');
      setEmployeeId('');
      setNotes('');
      setHasReceipt(false);

      // Close sheet
      onOpenChange(false);

      // Trigger refresh of time entries
      onSuccess();
    } catch (error: any) {
      console.error('Error adding time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not add time entry',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log Time</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.employee_id} value={employee.employee_id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours: {getCalculatedHours().toFixed(1)}</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Details about the work performed"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="hasReceipt" checked={hasReceipt} onCheckedChange={setHasReceipt} />
            <Label htmlFor="hasReceipt">Has receipt or documentation</Label>
          </div>

          <SheetFooter className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Time Entry'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectTimelogAddSheet;
