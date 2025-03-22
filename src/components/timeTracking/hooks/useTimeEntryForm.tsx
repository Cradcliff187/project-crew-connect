
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReceiptMetadata } from '@/types/timeTracking';

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
  
  // Function to create a work order time log
  const createWorkOrderTimeLog = async (workOrderId: string, hoursWorked: number, employeeId: string | null | undefined, workDate: Date, notes?: string) => {
    try {
      // Create a time log entry in work_order_time_logs
      const { error: logError } = await supabase
        .from('work_order_time_logs')
        .insert({
          work_order_id: workOrderId,
          employee_id: employeeId || null,
          hours_worked: hoursWorked,
          notes: notes,
          work_date: format(workDate, 'yyyy-MM-dd'),
        });
        
      if (logError) {
        console.error('Error creating work order time log:', logError);
        throw logError;
      }
      
      console.log('Successfully created work order time log');
      return true;
    } catch (error) {
      console.error('Error creating work order time log:', error);
      throw error;
    }
  };
  
  // Function to create a project expense for labor
  const createProjectExpense = async (projectId: string, hoursWorked: number, employeeRate: number | null, workDate: Date, notes?: string) => {
    try {
      // Create a project expense for the labor
      const actualRate = employeeRate || 75; // Default to $75/hr if no specific rate
      const amount = hoursWorked * actualRate;
      
      const { error: expenseError } = await supabase
        .from('project_expenses')
        .insert({
          project_id: projectId,
          description: `Labor: ${hoursWorked} hours${notes ? ' - ' + notes : ''}`,
          amount: amount,
          expense_date: format(workDate, 'yyyy-MM-dd')
        });
        
      if (expenseError) {
        console.error('Error creating project expense:', expenseError);
        throw expenseError;
      }
      
      console.log('Successfully created project expense');
      return true;
    } catch (error) {
      console.error('Error creating project expense:', error);
      throw error;
    }
  };
  
  const confirmSubmit = async () => {
    if (!confirmationData) return;
    
    setIsLoading(true);
    
    try {
      let employeeRate = null;
      let employeeName = null;
      
      if (confirmationData.employeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate, first_name, last_name')
          .eq('employee_id', confirmationData.employeeId)
          .maybeSingle();
        
        if (empData) {
          employeeRate = empData.hourly_rate;
          employeeName = `${empData.first_name} ${empData.last_name}`;
        }
      }
      
      // Get receipt metadata from localStorage if available
      let receiptMetadata: ReceiptMetadata = {};
      try {
        const storedMetadata = localStorage.getItem('timeEntryReceiptMetadata');
        if (storedMetadata) {
          receiptMetadata = JSON.parse(storedMetadata);
          // Clear after reading
          localStorage.removeItem('timeEntryReceiptMetadata');
        }
      } catch (e) {
        console.error('Error parsing receipt metadata:', e);
      }
      
      console.log('Receipt metadata:', receiptMetadata);
      
      // Calculate total amount for tracking
      const laborCost = confirmationData.hoursWorked * (employeeRate || 75);
      const receiptAmount = receiptMetadata.amount || 0;
      const totalCost = laborCost + receiptAmount;

      // Get vendor name for the receipt if vendorId is provided
      let vendorName = null;
      if (receiptMetadata.vendorId) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('vendorname')
          .eq('vendorid', receiptMetadata.vendorId)
          .maybeSingle();
          
        if (vendorData) {
          vendorName = vendorData.vendorname;
        }
      }
      
      // Create the main time entry record in time_entries table
      const timeEntry = {
        entity_type: confirmationData.entityType,
        entity_id: confirmationData.entityId,
        date_worked: format(confirmationData.workDate, 'yyyy-MM-dd'),
        start_time: confirmationData.startTime,
        end_time: confirmationData.endTime,
        hours_worked: confirmationData.hoursWorked,
        employee_id: confirmationData.employeeId || null,
        employee_name: employeeName,
        employee_rate: employeeRate,
        notes: confirmationData.notes,
        has_receipts: hasReceipts && selectedFiles.length > 0,
        receipt_amount: receiptMetadata.amount || null,
        vendor_id: receiptMetadata.vendorId || null,
        vendor_name: vendorName,
        total_cost: totalCost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating time entry:', error);
        throw error;
      }
      
      console.log('Successfully created time entry with ID:', insertedEntry.id);
      
      // Now create the corresponding entity-specific records
      if (confirmationData.entityType === 'work_order') {
        await createWorkOrderTimeLog(
          confirmationData.entityId, 
          confirmationData.hoursWorked,
          confirmationData.employeeId,
          confirmationData.workDate,
          confirmationData.notes
        );
      } else if (confirmationData.entityType === 'project') {
        await createProjectExpense(
          confirmationData.entityId,
          confirmationData.hoursWorked,
          employeeRate,
          confirmationData.workDate,
          confirmationData.notes
        );
      }
      
      // Handle receipt uploads if any
      if (hasReceipts && selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${uuidv4()}.${fileExt}`;
          const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Error uploading receipt:', uploadError);
            throw uploadError;
          }
          
          const { error: receiptError } = await supabase
            .from('time_entry_receipts')
            .insert({
              time_entry_id: insertedEntry.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
              amount: receiptMetadata.amount || null,
              vendor_id: receiptMetadata.vendorId || null,
              uploaded_at: new Date().toISOString()
            });
            
          if (receiptError) {
            console.error('Error recording receipt:', receiptError);
            throw receiptError;
          }
          
          // If vendor is selected, also create a document record for better integration with the document system
          if (receiptMetadata.vendorId) {
            try {
              const documentData = {
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: filePath,
                entity_type: confirmationData.entityType.toUpperCase(),
                entity_id: confirmationData.entityId,
                tags: ['receipt', 'time-entry'],
                category: 'receipt',
                amount: receiptMetadata.amount || null,
                expense_date: format(confirmationData.workDate, 'yyyy-MM-dd'),
                version: 1,
                is_expense: true,
                notes: `Receipt for time entry on ${format(confirmationData.workDate, 'MMM d, yyyy')}`,
                vendor_id: receiptMetadata.vendorId,
              };
              
              const { error: docError } = await supabase
                .from('documents')
                .insert(documentData);
                
              if (docError) {
                console.error('Error creating document record:', docError);
                // Continue execution even if this fails
              }
            } catch (docError) {
              console.error('Error in document creation:', docError);
              // Continue execution even if this fails
            }
          }
        }
        
        console.log('Successfully uploaded', selectedFiles.length, 'receipt(s)');
        
        // If vendor and amount provided, create a materials or expense record
        if (receiptMetadata.vendorId && receiptMetadata.amount && receiptMetadata.amount > 0) {
          if (confirmationData.entityType === 'work_order') {
            // Create a material record for the work order
            try {
              const { error: materialError } = await supabase
                .from('work_order_materials')
                .insert({
                  work_order_id: confirmationData.entityId,
                  material_name: 'Receipt Expense',
                  quantity: 1,
                  unit_price: receiptMetadata.amount,
                  total_price: receiptMetadata.amount,
                  vendor_id: receiptMetadata.vendorId,
                  notes: `Expense from time entry on ${format(confirmationData.workDate, 'MMM d, yyyy')}`,
                  purchase_date: format(confirmationData.workDate, 'yyyy-MM-dd'),
                  has_receipt: true
                });
                
              if (materialError) {
                console.error('Error creating work order material:', materialError);
              }
            } catch (materialError) {
              console.error('Error in work order material creation:', materialError);
            }
          } else if (confirmationData.entityType === 'project') {
            // Create an expense record for the project
            try {
              const { error: expenseError } = await supabase
                .from('project_expenses')
                .insert({
                  project_id: confirmationData.entityId,
                  description: `Material expense from time entry on ${format(confirmationData.workDate, 'MMM d, yyyy')}`,
                  amount: receiptMetadata.amount,
                  expense_date: format(confirmationData.workDate, 'yyyy-MM-dd'),
                  vendor_id: receiptMetadata.vendorId,
                  has_receipt: true
                });
                
              if (expenseError) {
                console.error('Error creating project expense:', expenseError);
              }
            } catch (expenseError) {
              console.error('Error in project expense creation:', expenseError);
            }
          }
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
