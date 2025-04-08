
import { useState } from 'react';
import { TimeEntryFormValues } from '@/components/timeTracking/hooks/useTimeEntryForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useReceiptUploadService } from './useReceiptUploadService';
import { useExpenseService } from './useExpenseService';
import { ReceiptMetadata } from '@/types/timeTracking';

export function useTimeEntryCore(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadReceipts } = useReceiptUploadService();
  const { createExpenseEntries } = useExpenseService();

  const submitTimeEntry = async (
    data: TimeEntryFormValues,
    selectedFiles: File[] = [],
    receiptMetadata: ReceiptMetadata = { 
      category: 'receipt', 
      expenseType: null, 
      tags: ['time-entry'],
      vendorType: 'vendor',
      vendorId: undefined,
      amount: undefined
    }
  ) => {
    setIsSubmitting(true);
    
    try {
      // Validate that employee ID is provided
      if (!data.employeeId) {
        throw new Error('Employee selection is required');
      }
      
      // Get employee rate if available
      let employeeRate = null;
      if (data.employeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', data.employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      // Create the time entry
      const timeEntry = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        date_worked: format(data.workDate, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hours_worked: data.hoursWorked,
        employee_id: data.employeeId,
        employee_rate: employeeRate,
        notes: data.notes,
        has_receipts: selectedFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Upload receipts if provided
      if (selectedFiles.length > 0 && insertedEntry) {
        await uploadReceipts(
          insertedEntry.id,
          data.entityType,
          data.entityId,
          selectedFiles,
          receiptMetadata
        );
      }
      
      // Create expense entries
      await createExpenseEntries(
        insertedEntry.id,
        data.entityType,
        data.entityId,
        data.hoursWorked,
        employeeRate,
        selectedFiles.length > 0
      );
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error submitting time entry',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitTimeEntry
  };
}
