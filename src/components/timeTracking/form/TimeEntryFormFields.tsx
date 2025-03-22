
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Timer, DollarSign } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import EntityTypeSelector from './EntityTypeSelector';
import EntitySelector from './EntitySelector';
import TimeRangeSelector from './TimeRangeSelector';
import { TimeEntryFormValues } from '../hooks/useTimeEntryForm';
import { TimeFormEmployee } from '@/types/timeTracking';

interface TimeEntryFormFieldsProps {
  form: UseFormReturn<TimeEntryFormValues>;
  workOrders: any[];
  projects: any[];
  employees: TimeFormEmployee[];
  isLoadingEntities: boolean;
  getSelectedEntityDetails: () => any;
  selectedEmployeeRate: number | null;
  setSelectedEmployeeRate: (rate: number | null) => void;
}

const TimeEntryFormFields: React.FC<TimeEntryFormFieldsProps> = ({
  form,
  workOrders,
  projects,
  employees,
  isLoadingEntities,
  getSelectedEntityDetails,
  selectedEmployeeRate,
  setSelectedEmployeeRate
}) => {
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const hoursWorked = form.watch('hoursWorked');
  const employeeId = form.watch('employeeId');

  // Safely update employee rate when employeeId changes
  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const employee = employees.find(emp => emp.employee_id === employeeId);
      if (employee?.hourly_rate !== selectedEmployeeRate) {
        setSelectedEmployeeRate(employee?.hourly_rate || null);
      }
    } else if (selectedEmployeeRate !== null) {
      setSelectedEmployeeRate(null);
    }
  }, [employeeId, employees, selectedEmployeeRate, setSelectedEmployeeRate]);

  const laborCost = hoursWorked * (selectedEmployeeRate || 75);

  // Handlers to prevent re-renders in render
  const handleEntityTypeChange = (value: 'work_order' | 'project') => {
    form.setValue('entityType', value, { shouldValidate: true });
  };

  const handleEntityIdChange = (value: string) => {
    form.setValue('entityId', value, { shouldValidate: true });
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setValue('employeeId', e.target.value, { shouldValidate: true });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('workDate', date, { shouldValidate: true });
    }
  };

  const handleStartTimeChange = (value: string) => {
    form.setValue('startTime', value, { shouldValidate: true });
    if (endTime) {
      const [startHour, startMinute] = value.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      
      if (endTotal <= startTotal && endTotal > startTotal - 120) {
        let newEndHour = startHour + 1;
        if (newEndHour >= 24) newEndHour -= 24;
        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        form.setValue('endTime', newEndTime, { shouldValidate: true });
      }
    }
  };

  const handleEndTimeChange = (value: string) => {
    form.setValue('endTime', value, { shouldValidate: true });
  };

  return (
    <CardContent className="space-y-6">
      <EntityTypeSelector 
        entityType={entityType} 
        onChange={handleEntityTypeChange}
      />
      
      <EntitySelector
        entityType={entityType}
        entityId={entityId}
        workOrders={workOrders}
        projects={projects}
        isLoading={isLoadingEntities}
        onChange={handleEntityIdChange}
        error={form.formState.errors.entityId?.message}
        selectedEntity={getSelectedEntityDetails()}
        required={true}
      />
      
      <div className="space-y-2">
        <Label htmlFor="employee">Employee</Label>
        <select
          id="employee"
          className="w-full border border-gray-300 rounded-md p-2"
          value={employeeId || ''}
          onChange={handleEmployeeChange}
        >
          {employees.map(employee => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.name} {employee.hourly_rate ? `- $${employee.hourly_rate}/hr` : ''}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch('workDate') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('workDate') ? (
                format(form.watch('workDate'), "MMMM d, yyyy")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch('workDate')}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Time Range</Label>
          {startTime && endTime && (
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              <Timer className="h-3.5 w-3.5 mr-1" />
              <span>Duration: {hoursWorked.toFixed(2)} hours</span>
            </div>
          )}
        </div>
        
        <TimeRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          startTimeError={form.formState.errors.startTime?.message}
          endTimeError={form.formState.errors.endTime?.message}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hoursWorked">Total Hours</Label>
          <Input
            id="hoursWorked"
            type="number"
            step="0.01"
            readOnly
            value={hoursWorked}
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="laborCost">Estimated Labor Cost</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
            </span>
            <Input
              id="laborCost"
              type="text"
              readOnly
              value={laborCost.toFixed(2)}
              className="bg-muted pl-9"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Based on {selectedEmployeeRate ? `$${selectedEmployeeRate.toFixed(2)}` : '$75.00'}/hr
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about the work performed..."
          {...form.register('notes')}
          rows={3}
        />
      </div>
    </CardContent>
  );
};

export default TimeEntryFormFields;
