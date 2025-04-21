import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import TimeRangeSelector from './form/TimeRangeSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { calculateHours } from './utils/timeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EmployeeSelect from './form/EmployeeSelect';
import { QuickLogFormValues } from '@/types/timeTracking';
import { adaptEmployeesFromDatabase } from '@/utils/employeeAdapter';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  date: Date;
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  date,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [hoursWorked, setHoursWorked] = useState(8);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [entityType, setEntityType] = useState<'work_order' | 'project'>('work_order');
  const [entityId, setEntityId] = useState('');
  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [employeeId, setEmployeeId] = useState('none'); // Default to 'none' instead of empty string
  const [employees, setEmployees] = useState<{ employee_id: string; name: string }[]>([]);

  const { toast } = useToast();

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

  useEffect(() => {
    const fetchRecentEntities = async () => {
      if (entityType === 'work_order') {
        const { data } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (data) {
          setEntityOptions(
            data.map(wo => ({
              id: wo.work_order_id,
              name: wo.title,
            }))
          );
        }
      } else {
        const { data } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (data) {
          setEntityOptions(
            data.map(proj => ({
              id: proj.projectid,
              name: proj.projectname,
            }))
          );
        }
      }
    };

    fetchRecentEntities();
  }, [entityType]);

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
          const formattedEmployees = data.map(emp => ({
            employee_id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
          }));
          setEmployees(formattedEmployees);
        }
      } catch (error) {
        console.error('Exception when fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!entityId) {
      toast({
        title: 'Please select a work order or project',
        variant: 'destructive',
      });
      return;
    }

    if (timeError) {
      toast({
        title: 'Invalid time range',
        description: timeError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');

      let hourlyRate = null;
      const actualEmployeeId = employeeId === 'none' ? null : employeeId;

      if (actualEmployeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', actualEmployeeId)
          .maybeSingle();

        hourlyRate = empData?.hourly_rate;
      }

      const rate = hourlyRate || 75;
      const totalCost = hoursWorked * rate;

      const timeEntry = {
        entity_type: entityType,
        entity_id: entityId,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        hours_worked: hoursWorked,
        notes: notes || null,
        employee_id: actualEmployeeId,
        employee_rate: rate,
        total_cost: totalCost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();

      if (error) throw error;

      await supabase.from('expenses').insert({
        entity_type: entityType.toUpperCase(),
        entity_id: entityId,
        description: `Labor: ${hoursWorked} hours`,
        expense_type: 'LABOR',
        amount: totalCost,
        time_entry_id: insertedEntry.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        quantity: hoursWorked,
        unit_price: rate,
        vendor_id: null,
      });

      toast({
        title: 'Time entry added',
        description: `${hoursWorked} hours have been logged successfully.`,
      });

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

  const resetForm = () => {
    setStartTime('09:00');
    setEndTime('17:00');
    setHoursWorked(8);
    setNotes('');
    setTimeError('');
    setEmployeeId('none'); // Reset to 'none' not empty string
    setEntityId('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Quick Time Log</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={entityType === 'work_order' ? 'default' : 'outline'}
                onClick={() => setEntityType('work_order')}
                className={entityType === 'work_order' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
              >
                Work Order
              </Button>
              <Button
                type="button"
                variant={entityType === 'project' ? 'default' : 'outline'}
                onClick={() => setEntityType('project')}
                className={entityType === 'project' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
              >
                Project
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select {entityType === 'work_order' ? 'Work Order' : 'Project'}
            </label>
            <select
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              value={entityId}
              onChange={e => setEntityId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select...</option>
              {entityOptions.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <EmployeeSelect value={employeeId} onChange={setEmployeeId} employees={adaptEmployeesFromDatabase(employees)} />

          <TimeRangeSelector
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            error={timeError}
            hoursWorked={hoursWorked}
          />

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What did you work on?"
              disabled={isSubmitting}
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
              onClick={handleSubmit}
              disabled={isSubmitting || !entityId || !!timeError}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? 'Saving...' : 'Log Time'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
