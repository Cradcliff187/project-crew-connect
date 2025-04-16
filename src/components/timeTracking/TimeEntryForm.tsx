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
import { Employee, getEmployeeFullName } from '@/types/common';
import { Label } from '@/components/ui/label';

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
  title = 'Time Entry',
}) => {
  const [startTime, setStartTime] = useState(initialValues?.start_time || '09:00');
  const [endTime, setEndTime] = useState(initialValues?.end_time || '17:00');
  const [hoursWorked, setHoursWorked] = useState(initialValues?.hours_worked || 0);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [employeeId, setEmployeeId] = useState<string>(initialValues?.employee_id || 'none');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workDate, setWorkDate] = useState<Date>(
    initialValues?.date_worked
      ? parse(initialValues.date_worked, 'yyyy-MM-dd', new Date())
      : new Date()
  );
  const [timeError, setTimeError] = useState('');

  // Fetch employees using the standardized Employee interface
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, email, phone, role, hourly_rate, status')
          .order('last_name');

        if (error) {
          console.error('Error fetching employees:', error);
          return;
        }

        if (data) {
          setEmployees(data);
        }
      } catch (error) {
        console.error('Exception when fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Use the useEffect hook to ensure correct employee data handling
  useEffect(() => {
    // Calculate hours worked when start or end time changes
    if (startTime && endTime) {
      try {
        const hours = calculateHours(startTime, endTime);
        setHoursWorked(Number(hours.toFixed(2)));
        setTimeError('');
      } catch (error) {
        setTimeError('End time must be after start time');
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!workDate) {
      return;
    }

    if (timeError) {
      return;
    }

    // Format the date
    const formattedDate = format(workDate, 'yyyy-MM-dd');

    // Prepare the data for submission
    const formData: Partial<TimeEntry> = {
      ...initialValues,
      date_worked: formattedDate,
      start_time: startTime,
      end_time: endTime,
      hours_worked: hoursWorked,
      notes: notes,
      employee_id: employeeId === 'none' ? null : employeeId,
    };

    // Submit the form
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-medium mb-2">{title}</h2>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="workDate">Date</Label>
          <div className="mt-1">
            <DatePicker date={workDate} setDate={setWorkDate} />
          </div>
        </div>

        <TimeRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          error={timeError}
          hoursWorked={hoursWorked}
        />

        <EmployeeSelect value={employeeId} onChange={setEmployeeId} employees={employees} />

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any details about this time entry"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TimeEntryForm;
