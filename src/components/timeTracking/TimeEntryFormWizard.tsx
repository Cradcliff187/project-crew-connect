import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Building, Briefcase, CreditCard, Clock, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ReceiptUploader from './form/ReceiptUploader';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';
import { useEntityData } from './hooks/useEntityData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
  onCancel?: () => void;
  date: Date;
}

// Form schema - update to make employeeId required
const formSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().min(1, "Employee selection is required"),
  hasReceipts: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({
  onSuccess,
  onCancel,
  date
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasReceipts, setHasReceipts] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [vendor, setVendor] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | undefined>(undefined);
  
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      workDate: date,
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      notes: '',
      employeeId: '',
      hasReceipts: false
    },
    resolver: zodResolver(formSchema)
  });
  
  const handleDateChange = (newDate: Date) => {
    form.setValue('workDate', newDate);
  };
  
  const { 
    workOrders, 
    projects, 
    employees, 
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const workDate = form.watch('workDate');
  
  const selectedEntity = entityId ? getSelectedEntityDetails() : null;
  
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
  
  useEffect(() => {
    form.setValue('hasReceipts', selectedFiles.length > 0);
  }, [selectedFiles, form]);
  
  const uploadReceipts = async (timeEntryId: string, files: File[]) => {
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `receipts/time_entries/${timeEntryId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }
      
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
          expense_type: expenseType || null,
          vendor_id: vendor || null,
          amount: expenseAmount || null,
          tags: ['receipt', 'time-entry']
        })
        .select('document_id')
        .single();
        
      if (documentError) {
        console.error('Error creating document record:', documentError);
        continue;
      }
      
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .insert({
          time_entry_id: timeEntryId,
          document_id: document.document_id,
          created_at: new Date().toISOString()
        });
        
      if (linkError) {
        console.error('Error linking document to time entry:', linkError);
      }
    }
  };
  
  const submitTimeEntry = async (data: FormValues): Promise<{ id: string }> => {
    if (!data.employeeId) {
      throw new Error("Employee selection is required");
    }
    
    const timeEntry = {
      entity_type: data.entityType,
      entity_id: data.entityId,
      date_worked: format(data.workDate, 'yyyy-MM-dd'),
      start_time: data.startTime,
      end_time: data.endTime,
      hours_worked: data.hoursWorked,
      notes: data.notes || '',
      employee_id: data.employeeId,
      has_receipts: selectedFiles.length > 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location_data: null
    };
    
    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(timeEntry)
      .select('id')
      .single();
      
    if (error) throw error;
    return result;
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitTimeEntry(data);
      
      if (selectedFiles.length > 0) {
        await uploadReceipts(result.id, selectedFiles);
      }
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error submitting time entry',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNext = async () => {
    const currentFields = currentStep === 1 
      ? ['entityType', 'entityId'] 
      : ['startTime', 'endTime', 'hoursWorked'];
    
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setHasReceipts(files.length > 0);
  };
  
  const handleFileClear = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setHasReceipts(newFiles.length > 0);
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                location: selectedEntity.type === 'work_order' ? 'Location info' : undefined
              } : null}
            />
            
            {form.formState.errors.entityId && (
              <div className="text-sm text-red-500">
                {form.formState.errors.entityId.message}
              </div>
            )}
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
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={(value) => form.setValue('startTime', value)}
              onEndTimeChange={(value) => form.setValue('endTime', value)}
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
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(workDate, "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border p-4 pb-0">
              <ReceiptUploader 
                onFilesSelected={handleFileSelect}
                selectedFiles={selectedFiles}
                onFileClear={handleFileClear}
              />
            </div>
            
            {hasReceipts && (
              <div className="rounded-md border p-4">
                <div className="mb-3 font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-[#0485ea]" />
                  Receipt Details
                </div>
                
                <ReceiptMetadataForm
                  vendor={vendor}
                  expenseType={expenseType}
                  amount={expenseAmount}
                  onVendorChange={setVendor}
                  onExpenseTypeChange={setExpenseType}
                  onAmountChange={setExpenseAmount}
                  entityType={entityType}
                  entityId={entityId}
                />
              </div>
            )}
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <Label 
            htmlFor="employee" 
            className="flex items-center font-medium text-sm"
          >
            Employee <span className="text-red-500 ml-1">*</span>
          </Label>
          <select
            id="employee"
            className={`w-full border ${form.formState.errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
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
        
        <div className="flex justify-between">
          {currentStep === 1 ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="bg-[#0485ea] hover:bg-[#0375d1]">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default TimeEntryFormWizard;
