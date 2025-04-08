
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
    selectedFiles: File[],
    receiptMetadata: ReceiptMetadata = { 
      category: 'receipt', 
      expenseType: null, 
      tags: ['time-entry'] 
    }
  ) => {
    setIsSubmitting(true);
    console.log('Starting time entry submission with files:', selectedFiles.length);
    
    try {
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
      
      // Calculate total cost
      const hourlyRate = employeeRate || 75; // Default rate
      const totalCost = data.hoursWorked * hourlyRate;
      
      // Create the time entry
      const timeEntry = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        date_worked: format(data.workDate, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hours_worked: data.hoursWorked,
        employee_id: data.employeeId || null,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: data.notes || null,
        has_receipts: selectedFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating time entry:', timeEntry);
      
      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();
        
      if (error) {
        console.error('Error inserting time entry:', error);
        throw error;
      }
      
      console.log('Time entry created successfully with ID:', insertedEntry.id);
      
      // Upload receipts if provided
      if (selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
            
            console.log('Uploading file to path:', filePath);
            
            // Upload the file to storage
            const { error: uploadError } = await supabase.storage
              .from('construction_documents')
              .upload(filePath, file);
              
            if (uploadError) {
              console.error('Error uploading file to storage:', uploadError);
              throw uploadError;
            }
            
            console.log('File uploaded successfully');
            
            const mimeType = file.type || `application/${fileExt}`;
            
            // Create document metadata
            const documentData = {
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
              expense_type: receiptMetadata.expenseType || 'other',
              vendor_id: receiptMetadata.vendorId || null,
              vendor_type: receiptMetadata.vendorType || null,
              amount: receiptMetadata.amount || null
            };
            
            console.log('Creating document record:', documentData);
            
            // Insert document record
            const { data: insertedDoc, error: documentError } = await supabase
              .from('documents')
              .insert(documentData)
              .select('document_id')
              .single();
              
            if (documentError) {
              console.error('Error creating document record:', documentError);
              throw documentError;
            }
            
            console.log('Document record created successfully with ID:', insertedDoc.document_id);
            
            // Link document to time entry using the optimized function
            console.log('Linking document to time entry using RPC function');
            const { data: linkResult, error: linkError } = await supabase
              .rpc('attach_document_to_time_entry', {
                p_time_entry_id: insertedEntry.id,
                p_document_id: insertedDoc.document_id
              });
              
            if (linkError) {
              console.error('Error linking document to time entry:', linkError);
              // Don't throw, continue with other operations
            } else {
              console.log('Document linked to time entry successfully');
            }
            
            // Create expense entry for receipts if we have an amount
            if (receiptMetadata.amount && receiptMetadata.amount > 0) {
              console.log('Creating expense record for receipt');
              const expenseData = {
                entity_type: data.entityType.toUpperCase(),
                entity_id: data.entityId,
                description: `Receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'MATERIAL',
                amount: receiptMetadata.amount,
                document_id: insertedDoc.document_id,
                time_entry_id: insertedEntry.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,
                unit_price: receiptMetadata.amount,
                vendor_id: receiptMetadata.vendorId || null,
                is_receipt: true
              };
              
              const { error: expenseError } = await supabase
                .from('expenses')
                .insert(expenseData);
                
              if (expenseError) {
                console.error('Error creating expense for receipt:', expenseError);
                // Continue execution despite error
              } else {
                console.log('Expense record created successfully');
              }
            }
          } catch (fileError: any) {
            console.error('Error processing file upload:', fileError);
            // Continue with other files - don't fail the whole submission for one file
            toast({
              title: 'Receipt upload issue',
              description: `Error with file ${file.name}: ${fileError.message}`,
              variant: 'destructive',
            });
          }
        }
      }
      
      // Create expense entry for labor time
      if (data.entityType === 'work_order' && data.hoursWorked > 0) {
        console.log('Creating labor expense record');
        const laborExpenseData = {
          entity_type: 'WORK_ORDER',
          entity_id: data.entityId,
          description: `Labor: ${data.hoursWorked} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: data.hoursWorked,
          unit_price: hourlyRate,
          vendor_id: null
        };
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert(laborExpenseData);
          
        if (laborExpenseError) {
          console.error('Error creating labor expense:', laborExpenseError);
        } else {
          console.log('Labor expense record created successfully');
        }
      }
      
      // Create expense entry for projects as well
      if (data.entityType === 'project' && data.hoursWorked > 0) {
        console.log('Creating project labor expense record');
        const projectLaborExpenseData = {
          entity_type: 'PROJECT',
          entity_id: data.entityId,
          description: `Labor: ${data.hoursWorked} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: data.hoursWorked,
          unit_price: hourlyRate,
          vendor_id: null
        };
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert(projectLaborExpenseData);
          
        if (laborExpenseError) {
          console.error('Error creating project labor expense:', laborExpenseError);
        } else {
          console.log('Project labor expense record created successfully');
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
