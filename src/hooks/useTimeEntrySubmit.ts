
import { useState } from 'react';
import { TimeEntryFormValues, ReceiptMetadata } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { uploadReceiptFile } from '@/components/timeTracking/utils/receiptUtils';

export function useTimeEntrySubmit(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitTimeEntry = async (
    data: TimeEntryFormValues,
    receiptFiles: File[] = [],
    receiptMetadata?: ReceiptMetadata
  ) => {
    setIsSubmitting(true);
    
    try {
      // Format date for database
      const formattedDate = format(data.workDate, 'yyyy-MM-dd');
      
      // Get employee rate if available
      let employeeRate = null;
      if (data.employeeId && data.employeeId !== 'none') {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', data.employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      // Calculate total cost
      const hourlyRate = employeeRate || 75; // Default rate
      const totalCost = data.hoursWorked * hourlyRate;
      
      // Create time entry
      const timeEntryData = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        employee_id: data.employeeId === 'none' ? null : data.employeeId,
        hours_worked: data.hoursWorked,
        date_worked: formattedDate,
        start_time: data.startTime,
        end_time: data.endTime,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: data.notes || null,
        has_receipts: data.hasReceipts || receiptFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating time entry:', error);
        throw error;
      }
      
      // Create expense entry for labor
      if (timeEntry?.id) {
        const laborExpenseData = {
          entity_type: data.entityType.toUpperCase(),
          entity_id: data.entityId,
          description: `Labor: ${data.hoursWorked} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: timeEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: data.hoursWorked,
          unit_price: hourlyRate
        };
        
        await supabase
          .from('expenses')
          .insert(laborExpenseData);
      }
      
      // Upload receipts if available
      if (receiptFiles.length > 0 && timeEntry?.id) {
        console.log(`Uploading ${receiptFiles.length} receipt files for time entry ${timeEntry.id}`);
        
        // Make sure we have a default expense type if not provided
        const expenseType = receiptMetadata?.expenseType || 'MATERIALS';
        
        // Process each receipt file
        for (const file of receiptFiles) {
          try {
            await uploadReceiptFile(file, timeEntry.id, {
              vendorId: receiptMetadata?.vendorId,
              amount: receiptMetadata?.amount,
              expenseType: expenseType,
              notes: data.notes
            });
          } catch (fileError) {
            console.error('Error processing receipt file:', fileError);
            // Continue with other files even if one fails
          }
        }
      }
      
      toast({
        title: "Time entry added",
        description: `${data.hoursWorked} hours have been logged successfully.`
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit time entry.",
        variant: "destructive"
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
