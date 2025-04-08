
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateHours } from '@/components/timeTracking/utils/timeUtils';
import TimeRangeSelector from '@/components/timeTracking/form/TimeRangeSelector';
import EmployeeSelector from '@/components/timeTracking/form/EmployeeSelector';

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
  onSuccess
}: TimelogAddSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workDate, setWorkDate] = useState<Date>(new Date());
  const [hoursWorked, setHoursWorked] = useState(8);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  
  // Calculate hours when times change
  const updateHoursWorked = (start: string, end: string) => {
    try {
      const hours = calculateHours(start, end);
      setHoursWorked(parseFloat(hours.toFixed(2)));
    } catch (error) {
      console.error('Error calculating hours:', error);
      setHoursWorked(0);
    }
  };

  // Handle start time change
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    updateHoursWorked(value, endTime);
  };

  // Handle end time change
  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    updateHoursWorked(startTime, value);
  };

  // Handle date change
  const handleDateChange = (date: Date) => {
    setWorkDate(date);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate employee selection
    if (!employeeId) {
      setEmployeeError('Please select an employee');
      toast({
        title: 'Employee required',
        description: 'Please select an employee for this time entry.',
        variant: 'destructive',
      });
      return;
    }
    
    if (hoursWorked <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter valid start and end times.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format date to ISO string and extract the date part
      const formattedDate = workDate.toISOString().split('T')[0];
      
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: employeeId,
        hours_worked: hoursWorked,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('time_entries')
        .insert(timelogEntry);
        
      if (error) throw error;
      
      toast({
        title: 'Time entry added',
        description: `${hoursWorked} hours have been logged for ${employees.find(e => e.employee_id === employeeId)?.name || 'employee'} on ${formattedDate}.`,
      });
      
      // Reset form and close sheet
      setStartTime('09:00');
      setEndTime('17:00');
      setWorkDate(new Date());
      setHoursWorked(8);
      setEmployeeId('');
      setNotes('');
      setEmployeeError('');
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
          <EmployeeSelector 
            employees={employees}
            selectedEmployeeId={employeeId}
            onChange={(value) => {
              setEmployeeId(value);
              setEmployeeError('');
            }}
            error={employeeError}
          />
          
          <div className="space-y-2">
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              date={workDate}
              onDateChange={handleDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              hoursWorked={hoursWorked}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about work performed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={isSubmitting}
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
