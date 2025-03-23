import { useState } from 'react';
import { TimeEntryFormValues } from './useTimeEntryForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function useTimeEntrySubmit(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTimeEntry = async (data: TimeEntryFormValues, selectedFiles: File[]) => {
    setIsSubmitting(true);
    
    try {
      let employeeRate = null;
      if (data.employeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', data.employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      const timeEntry = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        date_worked: format(data.workDate, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hours_worked: data.hoursWorked,
        employee_id: data.employeeId || null,
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
      
      if (selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const mimeType = file.type || `application/${fileExt}`;
          
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .insert({
              file_name: file.name,
              file_type: file.type,
              mime_type: mimeType,
              file_size: file.size,
              storage_path: filePath,
              entity_type: 'TIME_ENTRY',
              entity_id: insertedEntry.id,
              category: 'receipt',
              is_expense: true,
              uploaded_by: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              tags: ['receipt', 'time-entry']
            })
            .select('document_id')
            .single();
            
          if (documentError) throw documentError;
          
          const { data: linkResult, error: linkError } = await supabase
            .rpc('attach_document_to_time_entry', {
              p_time_entry_id: insertedEntry.id,
              p_document_id: documentData.document_id
            });
            
          if (linkError) {
            console.error('Error linking document to time entry:', linkError);
          }
          
          if (data.entityType === 'work_order') {
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert({
                entity_type: 'WORK_ORDER',
                entity_id: data.entityId,
                description: `Time entry receipt: ${file.name}`,
                expense_type: 'TIME_RECEIPT',
                amount: 0,
                document_id: documentData.document_id,
                time_entry_id: insertedEntry.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,
                unit_price: 0
              });
              
            if (expenseError) {
              console.error('Error creating expense for receipt:', expenseError);
            }
          }
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
