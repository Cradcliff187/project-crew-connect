
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
      
      // Default rate if none found
      const hourlyRate = employeeRate || 75; // Default to $75/hour if no employee rate
      
      // Calculate total cost
      const totalCost = data.hoursWorked * hourlyRate;
      
      // Create time entry with proper cost calculation
      const timeEntry = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        date_worked: format(data.workDate, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hours_worked: data.hoursWorked,
        employee_id: data.employeeId || null,
        employee_rate: hourlyRate, // Store the actual rate used
        total_cost: totalCost, // Store the calculated total cost
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
        }
      }
      
      // Create expense entry for the labor time for work orders
      if (data.entityType === 'work_order' && data.hoursWorked > 0) {
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: 'WORK_ORDER',
            entity_id: data.entityId,
            description: `Labor: ${data.hoursWorked} hours`,
            expense_type: 'LABOR',
            amount: totalCost, // Use the same total cost
            time_entry_id: insertedEntry.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: data.hoursWorked,
            unit_price: hourlyRate,
            vendor_id: null
          });
          
        if (laborExpenseError) {
          console.error('Error creating labor expense:', laborExpenseError);
        }
      }
      
      // Create expense entry for projects as well
      if (data.entityType === 'project' && data.hoursWorked > 0) {
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
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
