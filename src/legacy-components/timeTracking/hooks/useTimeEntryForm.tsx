import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTimeEntrySubmit } from './useTimeEntrySubmit';
import { toast } from '@/hooks/use-toast';
import { calculateHours } from '@/utils/time/timeUtils';
import { TimeEntryFormValues, ReceiptMetadata } from '@/types/timeTracking';
import { useEntityData } from './useEntityData';

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, 'Please select a work order or project'),
  workDate: z.date(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  hoursWorked: z.number().min(0.01, 'Hours must be greater than 0'),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
  hasReceipts: z.boolean().default(false),

  // Calendar integration fields
  calendar_sync_enabled: z.boolean().default(false),
  calendar_event_id: z.string().optional(),
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
  calendar_sync_enabled: false,
};

interface UseTimeEntryFormProps {
  onSuccess: () => void;
  initialValues?: Partial<TimeEntryFormValues>;
}

export function useTimeEntryForm({ onSuccess, initialValues }: UseTimeEntryFormProps) {
  const [formData, setFormData] = useState<TimeEntryFormValues>({
    entityType: 'project',
    entityId: '',
    workDate: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    hoursWorked: 8,
    employeeId: '',
    notes: '',
    calendar_sync_enabled: false,
    ...initialValues,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<ReceiptMetadata>({
    category: 'receipt',
    expenseType: null,
    tags: ['time-entry'],
  });

  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  const { entities, isLoading: entitiesLoading } = useEntityData(formData.entityType);

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
  const updateReceiptMetadata = (data: Partial<ReceiptMetadata>) => {
    setReceiptMetadata(prev => ({
      ...prev,
      ...data,
    }));
  };

  // Validate form before submission
  const validateReceiptData = () => {
    // If hasReceipts is true but no files were selected
    if (hasReceipts && selectedFiles.length === 0) {
      toast({
        title: 'Receipt required',
        description:
          'You indicated you have receipts but none were uploaded. Please upload at least one receipt or turn off the receipt option.',
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
    if (
      hasReceipts &&
      selectedFiles.length > 0 &&
      receiptMetadata.vendorType !== 'other' &&
      !receiptMetadata.vendorId
    ) {
      toast({
        title: 'Vendor required',
        description: `Please select a ${receiptMetadata.vendorType} for this receipt.`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.entityId) {
      toast({
        title: 'Missing information',
        description: 'Please select a project or work order.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.hoursWorked <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Hours worked must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateReceiptData()) {
      return;
    }

    await submitTimeEntry(formData, selectedFiles, receiptMetadata);
  };

  const resetForm = () => {
    setFormData({
      entityType: 'project',
      entityId: '',
      workDate: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      employeeId: '',
      notes: '',
      calendar_sync_enabled: false,
    });
    setSelectedFiles([]);
    setReceiptMetadata({
      category: 'receipt',
      expenseType: null,
      tags: ['time-entry'],
    });
  };

  return {
    form,
    formData,
    setFormData,
    selectedFiles,
    setSelectedFiles,
    receiptMetadata,
    setReceiptMetadata,
    entities,
    entitiesLoading,
    isSubmitting,
    handleSubmit,
    resetForm,
    handleFilesSelected,
    handleFileClear,
    updateReceiptMetadata,
  };
}
