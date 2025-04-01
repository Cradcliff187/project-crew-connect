
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useTimeEntrySubmit } from './useTimeEntrySubmit';

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
});

export type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

const defaultFormValues: TimeEntryFormValues = {
  entityType: 'work_order',
  entityId: '',
  workDate: new Date(),
  startTime: '',
  endTime: '',
  hoursWorked: 0,
  notes: '',
  employeeId: '',
};

export function useTimeEntryForm(onSuccess: () => void) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<TimeEntryFormValues | null>(null);
  
  // Use our new submission hook
  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: defaultFormValues,
  });
  
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      const totalHours = hours + (minutes / 60);
      form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
    }
  }, [startTime, endTime, form]);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (data: TimeEntryFormValues) => {
    setConfirmationData(data);
    setShowConfirmDialog(true);
  };
  
  const confirmSubmit = async () => {
    if (!confirmationData) return;
    
    try {
      await submitTimeEntry(confirmationData, selectedFiles);
      
      form.reset(defaultFormValues);
      setSelectedFiles([]);
      setShowConfirmDialog(false);
    } catch (error) {
      // Error handling is already done in submitTimeEntry
      console.error("Error in confirmSubmit:", error);
    }
  };
  
  return {
    form,
    isLoading: isSubmitting,
    showConfirmDialog,
    setShowConfirmDialog,
    selectedFiles,
    handleFilesSelected,
    handleFileClear,
    confirmationData,
    handleSubmit,
    confirmSubmit,
  };
}
