import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TimeRangeSelector from './form/TimeRangeSelector';
import EmployeeSelect from './form/EmployeeSelect';
import { TimeEntry } from '@/types/timeTracking';
import { calculateHours } from './utils/timeUtils';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parse } from 'date-fns';
import { Employee, getEmployeeFullName } from '@/types/common';
import { Label } from '@/components/ui/label';
import { adaptEmployeesFromDatabase } from '@/utils/employeeAdapter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarIntegrationToggle } from '@/components/common/CalendarIntegrationToggle';

interface TimeEntryFormProps {
  initialValues?: Partial<TimeEntry>;
  onSubmit: (values: Partial<TimeEntry>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  title?: string;
  employees: Employee[];
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  title = 'Time Entry',
  employees,
}) => {
  const [startTime, setStartTime] = useState(initialValues?.start_time || '09:00');
  const [endTime, setEndTime] = useState(initialValues?.end_time || '17:00');
  const [hoursWorked, setHoursWorked] = useState(initialValues?.hours_worked || 0);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [employeeId, setEmployeeId] = useState<string>(initialValues?.employee_id || 'none');
  const [workDate, setWorkDate] = useState<Date>(
    initialValues?.date_worked
      ? parse(initialValues.date_worked, 'yyyy-MM-dd', new Date())
      : new Date()
  );
  const [timeError, setTimeError] = useState('');
  const [internalEmployees, setInternalEmployees] = useState<Employee[]>([]);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(
    initialValues?.calendar_sync_enabled || false
  );

  const { toast } = useToast();

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
          setInternalEmployees(adaptEmployeesFromDatabase(data || []));
        }
      } catch (error) {
        console.error('Exception when fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
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
    if (!workDate || timeError) return;
    const formattedDate = format(workDate, 'yyyy-MM-dd');

    const formData: Partial<TimeEntry> = {
      ...initialValues,
      date_worked: formattedDate,
      start_time: startTime,
      end_time: endTime,
      hours_worked: hoursWorked,
      notes: notes,
      employee_id: employeeId === 'none' ? null : employeeId,
      calendar_sync_enabled: calendarSyncEnabled,
    };
    await onSubmit(formData);
  };

  const employeesToUse = employees.length > 0 ? employees : internalEmployees;
  const selectedEmployee = employeesToUse.find(e => e.id === employeeId);
  const employeeName = selectedEmployee ? getEmployeeFullName(selectedEmployee) : 'Time Entry';

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

        <EmployeeSelect value={employeeId} onChange={setEmployeeId} employees={employeesToUse} />

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any details about this time entry"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Google Calendar Integration */}
        <CalendarIntegrationToggle
          value={calendarSyncEnabled}
          onChange={setCalendarSyncEnabled}
          disabled={!workDate || !!timeError}
          disabledReason={
            timeError ? 'A valid time range is required for calendar integration.' : ''
          }
          description="Add this time entry to your Google Calendar"
          entityType="time_entry"
        />

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
