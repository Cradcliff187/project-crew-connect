
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculateHoursWorked } from '../utils/timeCalculations';
import { timeEntrySchema, TimeEntryFormValues } from '../schemas/timeEntrySchema';
import { submitTimeEntry } from '../utils/timeEntrySubmission';

export { TimeEntryFormValues } from '../schemas/timeEntrySchema';

export const useTimeEntryForm = (onSuccess: () => void, isEditMode: boolean = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<TimeEntryFormValues | null>(null);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      employeeId: '',
      workDate: new Date(),
      startTime: '08:00',
      endTime: '17:00',
      hoursWorked: 9,
      notes: '',
    },
  });
  
  // Watch start and end times to calculate hours worked
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  // Update hours worked whenever start or end time changes
  if (startTime && endTime) {
    try {
      const hoursWorked = calculateHoursWorked(startTime, endTime);
      // Use setValue outside render to avoid infinite loop
      if (hoursWorked !== form.getValues('hoursWorked')) {
        form.setValue('hoursWorked', hoursWorked, { shouldValidate: false });
      }
    } catch (error) {
      console.error('Error calculating hours:', error);
    }
  }
  
  const handleSubmit = (values: TimeEntryFormValues) => {
    if (isEditMode) {
      // In edit mode, directly return the form values for the component to handle
      return values;
    } else {
      // In create mode, show confirmation dialog
      setConfirmationData(values);
      setShowConfirmDialog(true);
      return values; // Return values to satisfy the type system
    }
  };
  
  const confirmSubmit = async (): Promise<string | null> => {
    if (!confirmationData) return null;
    
    setIsLoading(true);
    try {
      const timeEntryId = await submitTimeEntry(confirmationData);
      setIsLoading(false);
      return timeEntryId;
    } catch (error) {
      setIsLoading(false);
      return null;
    }
  };
  
  return {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    confirmationData,
    handleSubmit,
    confirmSubmit
  };
};
