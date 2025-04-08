
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';
import { calculateHours } from './utils/timeUtils';
import TimeRangeSelector from './form/TimeRangeSelector';
import EmployeeSelect from './form/EmployeeSelect';

interface TimeEntryEditDialogProps {
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (timeEntry: TimeEntry) => Promise<void>;
  isSaving: boolean;
}

const TimeEntryEditDialog: React.FC<TimeEntryEditDialogProps> = ({ 
  timeEntry, 
  open, 
  onOpenChange, 
  onSave, 
  isSaving 
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hoursWorked, setHoursWorked] = useState(0);
  const [notes, setNotes] = useState('');
  const [timeError, setTimeError] = useState('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employees, setEmployees] = useState<{employee_id: string, name: string}[]>([]);

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
    
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Initialize form when time entry changes
  useEffect(() => {
    if (timeEntry) {
      setStartTime(timeEntry.start_time || '');
      setEndTime(timeEntry.end_time || '');
      setNotes(timeEntry.notes || '');
      setEmployeeId(timeEntry.employee_id || '');
      setHoursWorked(timeEntry.hours_worked || 0);
    }
  }, [timeEntry]);

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

  const handleSave = async () => {
    if (!timeEntry) return;
    if (timeError) return;

    await onSave({
      ...timeEntry,
      start_time: startTime,
      end_time: endTime,
      hours_worked: hoursWorked,
      notes,
      employee_id: employeeId || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogDescription>
            Make changes to your time entry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !!timeError}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryEditDialog;
