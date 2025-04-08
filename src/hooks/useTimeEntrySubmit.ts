
import { useState } from 'react';
import { TimeEntryFormValues } from '@/components/timeTracking/hooks/useTimeEntryForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ReceiptMetadata } from '@/types/timeTracking';

export function useTimeEntrySubmit(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTimeEntry = async (
    data: TimeEntryFormValues, 
    selectedFiles: File[] = [],
    receiptMetadata: ReceiptMetadata = { 
      category: 'receipt', 
      expenseType: null, 
      tags: ['time-entry'],
      vendorType: 'vendor' 
    }
  ) => {
    setIsSubmitting(true);
    
    try {
      // Validate that employee ID is provided
      if (!data.employeeId) {
        throw new Error('Employee selection is required');
      }
      
      let employeeRate = null;
      if (data.employeeId) {
        // Get employee rate if available
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
      
      // Upload receipts if provided, with enhanced metadata
      if (selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          // Create a unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
          
          // Upload the file to storage
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const mimeType = file.type || `application/${fileExt}`;
          
          // Enhanced document metadata for better categorization
          const documentMetadataObj = {
            file_name: file.name,
            file_type: file.type,
            mime_type: mimeType,
            file_size: file.size,
            storage_path: filePath,
            entity_type: 'TIME_ENTRY',
            entity_id: insertedEntry.id,
            category: receiptMetadata.category || 'receipt',
            is_expense: true,
            uploaded_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: receiptMetadata.tags || ['receipt', 'time-entry'],
            // Additional expense metadata
            expense_type: receiptMetadata.expenseType || 'other',
            // Add vendor information if available
            vendor_id: receiptMetadata.vendorId || null,
            vendor_type: receiptMetadata.vendorType || null,
            // Add amount if available
            amount: receiptMetadata.amount || null
          };
          
          // Create document record
          const { data: insertedDoc, error: documentError } = await supabase
            .from('documents')
            .insert(documentMetadataObj)
            .select('document_id')
            .single();
            
          if (documentError) throw documentError;
          
          // Link document to time entry
          const { data: linkResult, error: linkError } = await supabase
            .rpc('attach_document_to_time_entry', {
              p_time_entry_id: insertedEntry.id,
              p_document_id: insertedDoc.document_id
            });
            
          if (linkError) {
            console.error('Error linking document to time entry:', linkError);
          }
          
          // Create expense entries for work orders
          if (data.entityType === 'work_order') {
            // Create a more detailed expense entry for the time entry receipt
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert({
                entity_type: 'WORK_ORDER',
                entity_id: data.entityId,
                description: `Time entry receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'TIME_RECEIPT',
                amount: receiptMetadata.amount || 0,
                document_id: insertedDoc.document_id,
                time_entry_id: insertedEntry.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,
                unit_price: receiptMetadata.amount || 0,
                expense_date: new Date().toISOString(),
                vendor_id: receiptMetadata.vendorId || null
              });
              
            if (expenseError) {
              console.error('Error creating expense for receipt:', expenseError);
            }
            
            // If there's a vendor, create or update vendor association
            if (receiptMetadata.vendorId) {
              const { error: vendorAssocError } = await supabase
                .from('vendor_associations')
                .upsert({
                  vendor_id: receiptMetadata.vendorId,
                  entity_type: 'WORK_ORDER',
                  entity_id: data.entityId,
                  description: `Associated via time entry receipt`,
                  amount: receiptMetadata.amount || null,
                  expense_type: receiptMetadata.expenseType || null,
                  document_id: insertedDoc.document_id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (vendorAssocError) {
                console.error('Error creating vendor association:', vendorAssocError);
              }
            }
          }
          
          // For project entities, similar handling with project-specific logic
          if (data.entityType === 'project') {
            // Create project expense records
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert({
                entity_type: 'PROJECT',
                entity_id: data.entityId,
                description: `Time entry receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'TIME_RECEIPT',
                amount: receiptMetadata.amount || 0,
                document_id: insertedDoc.document_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,
                unit_price: receiptMetadata.amount || 0,
                expense_date: new Date().toISOString(),
                vendor_id: receiptMetadata.vendorId || null
              });
              
            if (expenseError) {
              console.error('Error creating project expense for receipt:', expenseError);
            }
            
            // If there's a vendor, create or update vendor association
            if (receiptMetadata.vendorId) {
              const { error: vendorAssocError } = await supabase
                .from('vendor_associations')
                .upsert({
                  vendor_id: receiptMetadata.vendorId,
                  entity_type: 'PROJECT',
                  entity_id: data.entityId,
                  description: `Associated via time entry receipt`,
                  amount: receiptMetadata.amount || null,
                  expense_type: receiptMetadata.expenseType || null,
                  document_id: insertedDoc.document_id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (vendorAssocError) {
                console.error('Error creating vendor association:', vendorAssocError);
              }
            }
          }
        }
      }
      
      // Create expense entry for the labor time if it's a work order
      if (data.entityType === 'work_order' && data.hoursWorked > 0) {
        const hourlyRate = employeeRate || 75; // Default to $75/hour if no employee rate
        const totalAmount = data.hoursWorked * hourlyRate;
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: 'WORK_ORDER',
            entity_id: data.entityId,
            description: `Labor: ${data.hoursWorked} hours`,
            expense_type: 'LABOR',
            amount: totalAmount,
            time_entry_id: insertedEntry.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: data.hoursWorked,
            unit_price: hourlyRate,
            vendor_id: null,
            expense_date: new Date().toISOString()
          });
          
        if (laborExpenseError) {
          console.error('Error creating labor expense:', laborExpenseError);
        }
      }
      
      // Also create labor expenses for projects to maintain consistency
      if (data.entityType === 'project' && data.hoursWorked > 0) {
        const hourlyRate = employeeRate || 75;
        const totalAmount = data.hoursWorked * hourlyRate;
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: 'PROJECT',
            entity_id: data.entityId,
            description: `Labor: ${data.hoursWorked} hours`,
            expense_type: 'LABOR',
            amount: totalAmount,
            time_entry_id: insertedEntry.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: data.hoursWorked,
            unit_price: hourlyRate,
            vendor_id: null,
            expense_date: new Date().toISOString()
          });
          
        if (laborExpenseError) {
          console.error('Error creating project labor expense:', laborExpenseError);
        }
      }
      
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
