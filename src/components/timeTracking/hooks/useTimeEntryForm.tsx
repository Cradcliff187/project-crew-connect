
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
});

export type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

const defaultFormValues: TimeEntryFormValues = {
  entityType: 'work_order',
  entityId: '',
  workDate: new Date(),
  startTime: '',
  endTime: '',
  hoursWorked: 0,
  notes: '',
  employeeId: '',
};

export function useTimeEntryForm(onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<TimeEntryFormValues | null>(null);
  const [hasReceipts, setHasReceipts] = useState(false);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: defaultFormValues,
  });
  
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      const totalHours = hours + (minutes / 60);
      form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
    }
  }, [startTime, endTime, form]);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (data: TimeEntryFormValues) => {
    setConfirmationData(data);
    setShowConfirmDialog(true);
  };
  
  const updateWorkOrderCosts = async (workOrderId: string, hoursWorked: number, employeeRate: number | null) => {
    try {
      // Create a time log entry in work_order_time_logs
      const { error: logError } = await supabase
        .from('work_order_time_logs')
        .insert({
          work_order_id: workOrderId,
          employee_id: confirmationData?.employeeId || null,
          hours_worked: hoursWorked,
          notes: confirmationData?.notes,
          work_date: new Date().toISOString(),
        });
        
      if (logError) {
        console.error('Error creating work order time log:', logError);
      } else {
        console.log('Successfully created work order time log');
      }
      
      // Note: The database trigger update_work_order_hours() will update the work order's actual_hours
      // and calculate_work_order_total_cost() will update the total_cost automatically
    } catch (error) {
      console.error('Error updating work order costs:', error);
      throw error;
    }
  };
  
  const updateProjectCosts = async (projectId: string, hoursWorked: number, employeeRate: number | null) => {
    try {
      // Create a project expense for the labor
      const actualRate = employeeRate || 75; // Default to $75/hr if no specific rate
      const amount = hoursWorked * actualRate;
      
      const { error: expenseError } = await supabase
        .from('project_expenses')
        .insert({
          project_id: projectId,
          description: `Labor: ${hoursWorked} hours${confirmationData?.notes ? ' - ' + confirmationData.notes : ''}`,
          amount: amount,
          expense_date: format(confirmationData?.workDate || new Date(), 'yyyy-MM-dd')
        });
        
      if (expenseError) {
        console.error('Error creating project expense:', expenseError);
      } else {
        console.log('Successfully created project expense');
      }
      
      // Note: The database trigger update_project_total_expenses() will update the project's current_expenses
      // and update_project_budget_status() will update the budget_status automatically
    } catch (error) {
      console.error('Error updating project costs:', error);
      throw error;
    }
  };
  
  const confirmSubmit = async () => {
    if (!confirmationData) return;
    
    setIsLoading(true);
    
    try {
      let employeeRate = null;
      if (confirmationData.employeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', confirmationData.employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      // First, create the time entry record
      const timeEntry = {
        entity_type: confirmationData.entityType,
        entity_id: confirmationData.entityId,
        date_worked: format(confirmationData.workDate, 'yyyy-MM-dd'),
        start_time: confirmationData.startTime,
        end_time: confirmationData.endTime,
        hours_worked: confirmationData.hoursWorked,
        employee_id: confirmationData.employeeId || null,
        employee_rate: employeeRate,
        notes: confirmationData.notes,
        has_receipts: hasReceipts && selectedFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Next, update costs for the associated entity
      if (confirmationData.entityType === 'work_order') {
        await updateWorkOrderCosts(
          confirmationData.entityId, 
          confirmationData.hoursWorked,
          employeeRate
        );
      } else if (confirmationData.entityType === 'project') {
        await updateProjectCosts(
          confirmationData.entityId,
          confirmationData.hoursWorked,
          employeeRate
        );
      }
      
      // Handle receipt uploads if any
      if (hasReceipts && selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { error: receiptError } = await supabase
            .from('time_entry_receipts')
            .insert({
              time_entry_id: insertedEntry.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
              uploaded_at: new Date().toISOString()
            });
            
          if (receiptError) throw receiptError;
        }
      }
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded and costs have been updated.',
      });
      
      form.reset(defaultFormValues);
      
      setSelectedFiles([]);
      setShowConfirmDialog(false);
      setHasReceipts(false);
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error submitting time entry',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    selectedFiles,
    handleFilesSelected,
    handleFileClear,
    confirmationData,
    handleSubmit,
    confirmSubmit,
    hasReceipts,
    setHasReceipts,
  };
}
