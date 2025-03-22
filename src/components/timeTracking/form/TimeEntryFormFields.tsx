
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntryFormValues } from '../hooks/useTimeEntryForm';
import { TimeFormEmployee } from '@/types/timeTracking';

import EntityTypeSelector from './EntityTypeSelector';
import EntitySelector from './EntitySelector';
import EmployeeSelect from './fields/EmployeeSelect';
import DateSelector from './fields/DateSelector';
import TimeDisplay from './fields/TimeDisplay';
import CostDisplay from './fields/CostDisplay';
import NotesField from './fields/NotesField';

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
  
  // Handlers to prevent re-renders
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
      
      <EmployeeSelect
        employeeId={employeeId}
        employees={employees}
        onChange={handleEmployeeChange}
        selectedEmployeeRate={selectedEmployeeRate}
        setSelectedEmployeeRate={setSelectedEmployeeRate}
      />
      
      <DateSelector
        date={form.watch('workDate')}
        onSelect={handleDateSelect}
      />
      
      <TimeDisplay
        startTime={startTime}
        endTime={endTime}
        hoursWorked={hoursWorked}
        onStartTimeChange={handleStartTimeChange}
        onEndTimeChange={handleEndTimeChange}
        startTimeError={form.formState.errors.startTime?.message}
        endTimeError={form.formState.errors.endTime?.message}
      />
      
      <CostDisplay
        hoursWorked={hoursWorked}
        selectedEmployeeRate={selectedEmployeeRate}
        startTime={startTime}
        endTime={endTime}
      />
      
      <NotesField register={form.register} />
    </CardContent>
  );
};

export default TimeEntryFormFields;
