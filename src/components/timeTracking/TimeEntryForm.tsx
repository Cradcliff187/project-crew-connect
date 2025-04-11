
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TimeRangeSelector from './form/TimeRangeSelector';
import EmployeeSelect from './form/EmployeeSelect';
import { TimeEntry } from '@/types/timeTracking';
import { supabase } from '@/integrations/supabase/client';
import { calculateHours } from './utils/timeUtils';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parse } from 'date-fns';

interface TimeEntryFormProps {
  initialValues?: Partial<TimeEntry>;
  onSubmit: (values: Partial<TimeEntry>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  title?: string;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  title = "Time Entry"
}) => {
  const [startTime, setStartTime] = useState(initialValues?.start_time || '09:00');
  const [endTime, setEndTime] = useState(initialValues?.end_time || '17:00');
  const [hoursWorked, setHoursWorked] = useState(initialValues?.hours_worked || 0);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [employeeId, setEmployeeId] = useState<string>(initialValues?.employee_id || 'none');
  const [employees, setEmployees] = useState<{employee_id: string, name: string}[]>([]);
  const [workDate, setWorkDate] = useState<Date>(
    initialValues?.date_worked 
      ? parse(initialValues.date_worked, 'yyyy-MM-dd', new Date()) 
      : new Date()
  );
  const [timeError, setTimeError] = useState('');

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name')
          .order('last_name');
          
        if (error) {
          console.error('Error fetching employees:', error);
          return;
        }
        
        if (data) {
          // Map the employees data to include a full name field
          const formattedEmployees = data.map(emp => ({
            employee_id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`
          }));
          setEmployees(formattedEmployees);
        }
      } catch (error) {
        console.error('Exception when fetching employees:', error);
      }
    };
    
    fetchEmployees();
  }, []);

  // Update hours when times change
  useEffect(() => {
    if (startTime && endTime) {
      try {
        const hours = calculateHours(startTime, endTime);
        if (hours <= 0) {
          setTimeError('End time must be after start time');
        } else {
          setTimeError('');
          setHoursWorked(hours);
        }
      } catch (error) {
        console.error('Error calculating hours:', error);
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timeError) return;
    
    const formattedDate = format(workDate, 'yyyy-MM-dd');
    
    await onSubmit({
      start_time: startTime,
      end_time: endTime,
      hours_worked: hoursWorked,
      notes,
      employee_id: employeeId === 'none' ? null : employeeId,
      date_worked: formattedDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Work Date</label>
        <DatePicker
          date={workDate}
          setDate={(date) => date && setWorkDate(date)}
        />
      </div>
      
      <TimeRangeSelector
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        error={timeError}
        hoursWorked={hoursWorked}
      />
      
      <EmployeeSelect
        value={employeeId}
        onChange={setEmployeeId}
        employees={employees}
      />
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">Notes</label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this time entry"
          className="h-24"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !!timeError}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default TimeEntryForm;
