
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Building, Briefcase, Clock, Loader2, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import { useEntityData } from './hooks/useEntityData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useReceiptUpload } from './hooks/useReceiptUpload';
import ReceiptUploadManager from './form/ReceiptUploadManager';
import { useDeviceCapabilities } from '@/hooks/use-mobile';

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
  onCancel?: () => void;
  date?: Date;
}

// Form schema with simpler validation
const formSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().min(1, "Employee selection is required")
});

type FormValues = z.infer<typeof formSchema>;

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({
  onSuccess,
  onCancel,
  date = new Date()
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { isMobile } = useDeviceCapabilities();
  
  // Receipt upload handling
  const {
    hasReceipts,
    setHasReceipts,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateMetadata,
    validateReceiptData
  } = useReceiptUpload();
  
  // Form setup with React Hook Form
  const form = useForm<FormValues>({
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      workDate: date,
      startTime: '08:00',
      endTime: '17:00',
      hoursWorked: 9,
      notes: '',
      employeeId: ''
    },
    resolver: zodResolver(formSchema)
  });
  
  // Access form values
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const workDate = form.watch('workDate');
  
  // Get entity data (work orders, projects, employees)
  const { 
    workOrders, 
    projects, 
    employees, 
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);
  
  // Get selected entity details
  const selectedEntity = entityId ? getSelectedEntityDetails() : null;
  
  // Calculate hours worked when times change
  useEffect(() => {
    if (startTime && endTime) {
      try {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (endMinutes > startMinutes) {
          const hoursWorked = parseFloat(((endMinutes - startMinutes) / 60).toFixed(2));
          form.setValue('hoursWorked', hoursWorked);
        }
      } catch (error) {
        console.error('Error calculating hours worked:', error);
      }
    }
  }, [startTime, endTime, form]);
  
  // Handle date change
  const handleDateChange = (newDate: Date) => {
    form.setValue('workDate', newDate);
  };
  
  // Submit time entry and receipts
  const submitTimeEntry = async (data: FormValues) => {
    if (!data.employeeId) {
      throw new Error("Employee selection is required");
    }
    
    // Get employee rate if available
    let employeeRate = null;
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('hourly_rate')
        .eq('employee_id', data.employeeId)
        .maybeSingle();
      
      employeeRate = empData?.hourly_rate;
    } catch (error) {
      console.error('Error getting employee rate:', error);
    }
    
    // Create time entry
    const timeEntry = {
      entity_type: data.entityType,
      entity_id: data.entityId,
      date_worked: format(data.workDate, 'yyyy-MM-dd'),
      start_time: data.startTime,
      end_time: data.endTime,
      hours_worked: data.hoursWorked,
      notes: data.notes || '',
      employee_id: data.employeeId,
      employee_rate: employeeRate,
      has_receipts: selectedFiles.length > 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(timeEntry)
      .select('id')
      .single();
      
    if (error) throw error;
    
    // Create labor expense record
    if (result && result.id) {
      const hourlyRate = employeeRate || 75; // Default rate if none set
      const totalAmount = data.hoursWorked * hourlyRate;
      
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          entity_type: data.entityType.toUpperCase(),
          entity_id: data.entityId,
          description: `Labor: ${data.hoursWorked} hours`,
          expense_type: 'LABOR',
          amount: totalAmount,
          time_entry_id: result.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: data.hoursWorked,
          unit_price: hourlyRate,
          expense_date: format(data.workDate, 'yyyy-MM-dd')
        });
        
      if (expenseError) {
        console.error('Error creating labor expense:', expenseError);
      }
    }
    
    // Upload receipts if any
    if (selectedFiles.length > 0 && result?.id) {
      await uploadReceipts(result.id, data);
    }
    
    return result;
  };
  
  // Upload receipts to storage and create document records
  const uploadReceipts = async (timeEntryId: string, formData: FormValues) => {
    for (const file of selectedFiles) {
      try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `receipts/time_entries/${timeEntryId}/${fileName}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('construction_documents')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }
        
        // Create document record in database
        const { data: document, error: documentError } = await supabase
          .from('documents')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            entity_type: 'TIME_ENTRY',
            entity_id: timeEntryId,
            category: 'receipt',
            is_expense: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            expense_type: receiptMetadata.expenseType || null,
            vendor_id: receiptMetadata.vendorId || null,
            amount: receiptMetadata.amount || null,
            expense_date: receiptMetadata.expenseDate ? format(receiptMetadata.expenseDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            tags: ['receipt', 'time-entry']
          })
          .select('document_id')
          .single();
          
        if (documentError) {
          console.error('Error creating document record:', documentError);
          continue;
        }
        
        // Link document to time entry
        const { error: linkError } = await supabase
          .from('time_entry_document_links')
          .insert({
            time_entry_id: timeEntryId,
            document_id: document.document_id,
            created_at: new Date().toISOString()
          });
          
        if (linkError) {
          console.error('Error linking document to time entry:', linkError);
          continue;
        }
        
        // Create expense record for receipt
        if (document) {
          const expenseData = {
            entity_type: formData.entityType.toUpperCase(),
            entity_id: formData.entityId,
            description: `Receipt: ${file.name}`,
            expense_type: receiptMetadata.expenseType || 'OTHER',
            amount: receiptMetadata.amount || 0,
            document_id: document.document_id,
            time_entry_id: timeEntryId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: 1,
            unit_price: receiptMetadata.amount || 0,
            expense_date: receiptMetadata.expenseDate ? format(receiptMetadata.expenseDate, 'yyyy-MM-dd') : format(formData.workDate, 'yyyy-MM-dd'),
            vendor_id: receiptMetadata.vendorId || null,
            is_receipt: true
          };
          
          const { error: expenseError } = await supabase
            .from('expenses')
            .insert(expenseData);
            
          if (expenseError) {
            console.error('Error creating expense for receipt:', expenseError);
          }
        }
      } catch (err) {
        console.error('Error processing receipt:', err);
      }
    }
  };
  
  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // If we have receipts, validate receipt data
      if (hasReceipts) {
        const validation = validateReceiptData();
        if (!validation.valid) {
          toast({
            title: "Receipt information required",
            description: validation.error,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit time entry and receipts
      await submitTimeEntry(data);
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error submitting time entry',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigation between form steps
  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['entityType', 'entityId'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['workDate', 'startTime', 'endTime', 'hoursWorked', 'employeeId'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Render employee selector with compact design for mobile
  const renderEmployeeSelector = () => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor="employee" 
          className="flex items-center font-medium text-sm"
        >
          Employee <span className="text-red-500 ml-1">*</span>
        </Label>
        <select
          id="employee"
          className={`w-full border ${form.formState.errors.employeeId ? 'border-red-500' : 'border-gray-300'} 
                     rounded-md p-2 bg-white text-sm`}
          {...form.register('employeeId')}
          required
        >
          <option value="">Select Employee</option>
          {employees.map(employee => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.name}
            </option>
          ))}
        </select>
        {form.formState.errors.employeeId && (
          <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
        )}
      </div>
    );
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-lg font-medium">Select Work Item</div>
            
            <EntityTypeSelector 
              value={entityType} 
              onChange={(value) => {
                form.setValue('entityType', value);
                form.setValue('entityId', '');
              }}
            />
            
            <EntitySelector
              entityType={entityType}
              entityId={entityId}
              workOrders={workOrders}
              projects={projects}
              isLoading={isLoadingEntities}
              onChange={(value) => form.setValue('entityId', value)}
              error={form.formState.errors.entityId?.message}
              selectedEntity={selectedEntity ? {
                name: selectedEntity.name,
                location: selectedEntity.location
              } : null}
            />
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-lg font-medium">Time Details</div>
            
            <div className="rounded-md border p-4">
              <div className="flex items-center mb-3">
                {entityType === 'work_order' ? (
                  <Briefcase className="h-5 w-5 mr-2 text-[#0485ea]" />
                ) : (
                  <Building className="h-5 w-5 mr-2 text-[#0485ea]" />
                )}
                <span className="font-medium">{selectedEntity?.name}</span>
              </div>
            </div>
            
            {renderEmployeeSelector()}
            
            <div className="space-y-2">
              <Label>Work Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !workDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {workDate ? format(workDate, "MMMM d, yyyy") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={workDate}
                    onSelect={(date) => date && handleDateChange(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    weekStartsOn={1} // Start week on Monday
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={(value) => form.setValue('startTime', value)}
              onEndTimeChange={(value) => form.setValue('endTime', value)}
              date={workDate}
              hoursWorked={form.watch('hoursWorked')}
              error={form.formState.errors.startTime?.message || form.formState.errors.endTime?.message}
            />
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about this time entry"
                {...form.register('notes')}
                className="h-24"
              />
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-lg font-medium">Receipts & Expenses</div>
            
            <div className="rounded-md border p-4">
              <div className="flex items-center mb-3">
                {entityType === 'work_order' ? (
                  <Briefcase className="h-5 w-5 mr-2 text-[#0485ea]" />
                ) : (
                  <Building className="h-5 w-5 mr-2 text-[#0485ea]" />
                )}
                <span className="font-medium">{selectedEntity?.name}</span>
              </div>
              
              <div className="flex flex-col text-sm text-muted-foreground">
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                </div>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(workDate, "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            
            <ReceiptUploadManager
              hasReceipts={hasReceipts}
              onHasReceiptsChange={setHasReceipts}
              files={selectedFiles}
              onFilesChange={handleFilesSelected}
              metadata={receiptMetadata}
              onMetadataChange={updateMetadata}
              entityType={entityType}
              entityId={entityId}
              showToggle={true}
              toggleLabel="Do you have receipts to upload?"
            />
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between">
          {currentStep === 1 ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting} className="bg-[#0485ea] hover:bg-[#0375d1]">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="bg-[#0485ea] hover:bg-[#0375d1]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Time Entry'
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default TimeEntryFormWizard;
