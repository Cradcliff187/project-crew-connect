import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { toast } from '@/hooks/use-toast';
import { calculateHours } from '@/components/timeTracking/utils/timeUtils';
import { ReceiptMetadata } from '@/types/timeTracking';

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().min(1, "Employee selection is required"),
  hasReceipts: z.boolean().default(false),
});

export type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

const defaultFormValues: TimeEntryFormValues = {
  entityType: 'work_order',
  entityId: '',
  workDate: new Date(),
  startTime: '09:00',
  endTime: '17:00',
  hoursWorked: 8,
  notes: '',
  employeeId: '',
  hasReceipts: false,
};

export function useTimeEntryForm(onSuccess: () => void) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<ReceiptMetadata>({
    category: 'receipt',
    expenseType: null,
    tags: ['time-entry'],
    vendorType: 'vendor'
  });
  
  // Use our submission hook
  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: defaultFormValues,
  });
  
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const hasReceipts = form.watch('hasReceipts');
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  
  useEffect(() => {
    if (startTime && endTime) {
      try {
        const totalHours = calculateHours(startTime, endTime);
        form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
      } catch (error) {
        console.error('Error calculating hours:', error);
        form.setValue('hoursWorked', 0);
      }
    }
  }, [startTime, endTime, form]);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0 && !form.watch('hasReceipts')) {
      form.setValue('hasReceipts', true);
    }
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        form.setValue('hasReceipts', false);
      }
      return newFiles;
    });
  };
  
  const updateReceiptMetadata = (
    data: Partial<ReceiptMetadata>
  ) => {
    setReceiptMetadata(prev => ({
      ...prev,
      ...data
    }));
  };
  
  const validateReceiptData = () => {
    if (form.watch('hasReceipts') && selectedFiles.length === 0) {
      return {
        valid: false,
        error: 'You indicated you have receipts but none were uploaded. Please upload at least one receipt or turn off the receipt option.'
      };
    }
    
    if (form.watch('hasReceipts') && selectedFiles.length > 0 && !receiptMetadata.expenseType) {
      return {
        valid: false,
        error: 'Please select an expense type for your receipt.'
      };
    }
    
    if (form.watch('hasReceipts') && selectedFiles.length > 0 && 
        receiptMetadata.vendorType !== 'other' && 
        !receiptMetadata.vendorId) {
      return {
        valid: false,
        error: `Please select a ${receiptMetadata.vendorType} for this receipt.`
      };
    }
    
    return { valid: true, error: null };
  };
  
  const handleSubmit = (data: TimeEntryFormValues) => {
    if (form.watch('hasReceipts')) {
      const validation = validateReceiptData();
      if (!validation.valid) {
        toast({
          title: "Receipt information required",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
    }
    
    submitTimeEntry(data, selectedFiles, receiptMetadata);
  };
  
  return {
    form,
    isLoading: isSubmitting,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateReceiptMetadata,
    validateReceiptData,
    handleSubmit,
  };
}
