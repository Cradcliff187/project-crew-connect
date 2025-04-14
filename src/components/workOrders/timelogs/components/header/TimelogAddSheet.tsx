import { useState } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatePicker } from '@/components/ui/date-picker';
import TimeRangeSelector from '@/components/timeTracking/form/TimeRangeSelector';
import { calculateHours } from '@/components/timeTracking/utils/timeUtils';
import EmployeeSelect from '@/components/timeTracking/form/EmployeeSelect';

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  employees: { employee_id: string; name: string }[];
  onSuccess: () => void;
}

const TimelogAddSheet = ({
  open,
  onOpenChange,
  workOrderId,
  employees,
  onSuccess,
}: TimelogAddSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hours, setHours] = useState(0);
  const [employeeId, setEmployeeId] = useState('none');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [timeError, setTimeError] = useState('');

  // Handle time changes and calculate hours
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    updateHoursWorked(value, endTime);
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    updateHoursWorked(startTime, value);
  };

  const updateHoursWorked = (start: string, end: string) => {
    try {
      const calculatedHours = calculateHours(start, end);
      if (calculatedHours <= 0) {
        setTimeError('End time must be after start time');
        setHours(0);
      } else {
        setTimeError('');
        setHours(calculatedHours);
      }
    } catch (error) {
      console.error('Error calculating hours:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setHours(0);
    setEmployeeId('none');
    setNotes('');
    setSelectedDate(new Date());
    setStartTime('09:00');
    setEndTime('17:00');
    setTimeError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (timeError) {
      toast({
        title: 'Invalid time range',
        description: timeError,
        variant: 'destructive',
      });
      return;
    }

    if (hours <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter a valid number of hours worked.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Check for "none" special value that means no employee is selected
      const actualEmployeeId = employeeId === 'none' ? null : employeeId;

      let employeeRate = null;
      if (actualEmployeeId) {
        // Get employee rate if available
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', actualEmployeeId)
          .maybeSingle();

        employeeRate = empData?.hourly_rate;
      }

      // Calculate total cost
      const hourlyRate = employeeRate || 75; // Default rate
      const totalCost = hours * hourlyRate;

      // Create time entry
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: actualEmployeeId,
        hours_worked: hours,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timelogEntry)
        .select('id')
        .single();

      if (error) throw error;

      // Create expense entry for labor time
      if (insertedEntry?.id) {
        const laborExpenseData = {
          entity_type: 'WORK_ORDER',
          entity_id: workOrderId,
          description: `Labor: ${hours} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: hours,
          unit_price: hourlyRate,
          vendor_id: null,
        };

        await supabase.from('expenses').insert(laborExpenseData);
      }

      toast({
        title: 'Time entry added',
        description: `${hours} hours have been logged successfully.`,
      });

      // Reset form and close sheet
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log Time</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker date={selectedDate} setDate={date => date && setSelectedDate(date)} />
          </div>

          <TimeRangeSelector
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            error={timeError}
            hoursWorked={hours}
          />

          <EmployeeSelect value={employeeId} onChange={setEmployeeId} employees={employees} />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about work performed..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || hours <= 0}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? 'Saving...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default TimelogAddSheet;
