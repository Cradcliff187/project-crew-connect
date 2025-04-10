
import { useState } from 'react';
import { TimeEntryFormValues, ReceiptMetadata } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

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
      if (data.employeeId) {
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
        employee_id: data.employeeId || null,
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
        
      if (error) throw error;
      
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
        // Process each receipt file
        for (const file of receiptFiles) {
          // Upload to storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `time_entries/${timeEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue;
          }
          
          // Create document record with proper schema fields
          const documentData: any = {
            entity_type: 'TIME_ENTRY',
            entity_id: timeEntry.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            category: 'receipt',
            is_expense: true,
            tags: ['time-entry', 'receipt'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Add receipt metadata if available
          if (receiptMetadata) {
            if (receiptMetadata.vendorId) {
              documentData.vendor_id = receiptMetadata.vendorId;
            }
            if (receiptMetadata.amount) {
              documentData.amount = receiptMetadata.amount;
            }
            if (receiptMetadata.expenseType) {
              documentData.expense_type = receiptMetadata.expenseType;
            }
          }
          
          const { data: document, error: docError } = await supabase
            .from('documents')
            .insert(documentData)
            .select('document_id')
            .single();
            
          if (docError) {
            console.error('Error creating document record:', docError);
            continue;
          }
          
          // Create link between time entry and document
          if (document?.document_id) {
            await supabase
              .from('time_entry_document_links')
              .insert({
                time_entry_id: timeEntry.id,
                document_id: document.document_id
              });
              
            // Create expense record from receipt with correct schema
            if (receiptMetadata?.amount) {
              // Add correct fields for the expenses table
              const expenseData = {
                entity_type: data.entityType.toUpperCase(),
                entity_id: data.entityId,
                description: `Receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'OTHER',
                amount: receiptMetadata.amount,
                vendor_id: receiptMetadata.vendorId,
                document_id: document.document_id,
                time_entry_id: timeEntry.id,
                is_receipt: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,  // Required field
                unit_price: receiptMetadata.amount  // Required field
              };
              
              await supabase
                .from('expenses')
                .insert(expenseData);
            }
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
