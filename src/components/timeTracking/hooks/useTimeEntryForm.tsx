
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { toast } from '@/hooks/use-toast';
import { calculateHours } from '@/components/timeTracking/utils/timeUtils';
import { TimeEntryFormValues, ReceiptMetadata } from '@/types/timeTracking';

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
  hasReceipts: z.boolean().default(false),
});

const defaultFormValues: TimeEntryFormValues = {
  entityType: 'work_order',
  entityId: '',
  workDate: new Date(),
  startTime: '',
  endTime: '',
  hoursWorked: 0,
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
  
  // Updated handlers for receipt-related functionality
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Automatically set hasReceipts to true if files are selected
    if (files.length > 0 && !hasReceipts) {
      form.setValue('hasReceipts', true);
    }
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // If no files left, optionally reset hasReceipts to false
      if (newFiles.length === 0) {
        form.setValue('hasReceipts', false);
      }
      return newFiles;
    });
  };
  
  // Update receipt metadata
  const updateReceiptMetadata = (
    data: Partial<ReceiptMetadata>
  ) => {
    setReceiptMetadata(prev => ({
      ...prev,
      ...data
    }));
  };
  
  // Validate form before submission
  const validateReceiptData = () => {
    // If hasReceipts is true but no files were selected
    if (hasReceipts && selectedFiles.length === 0) {
      toast({
        title: 'Receipt required',
        description: 'You indicated you have receipts but none were uploaded. Please upload at least one receipt or turn off the receipt option.',
        variant: 'destructive',
      });
      return false;
    }
    
    // If we have receipts but no expense type
    if (hasReceipts && selectedFiles.length > 0 && !receiptMetadata.expenseType) {
      toast({
        title: 'Expense type required',
        description: 'Please select an expense type for your receipt.',
        variant: 'destructive',
      });
      return false;
    }
    
    // If we have receipts but no vendor selected (unless it's 'other')
    if (hasReceipts && selectedFiles.length > 0 && 
        receiptMetadata.vendorType !== 'other' && 
        !receiptMetadata.vendorId) {
      toast({
        title: 'Vendor required',
        description: `Please select a ${receiptMetadata.vendorType} for this receipt.`,
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (data: TimeEntryFormValues) => {
    if (!validateReceiptData()) {
      return;
    }
    
    // Submit with enhanced receipt metadata
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
    handleSubmit,
  };
}
