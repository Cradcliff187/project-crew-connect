
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Building, Briefcase, CreditCard, Clock, Loader2 } from 'lucide-react';
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

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
  onCancel?: () => void;
  date: Date;
}

// Form schema
const formSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
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
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      workDate: date,
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      notes: '',
      hasReceipts: false
    },
    resolver: zodResolver(formSchema)
  });
  
  // Get entity data
  const { 
    workOrders, 
    projects, 
    employees, 
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);
  
  // Watch form fields
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  // Selected entity details
  const selectedEntity = entityId ? getSelectedEntityDetails() : null;
  
  // Update hours worked when start or end time changes
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
  
  // Update form when receipts are added or removed
  useEffect(() => {
    form.setValue('hasReceipts', selectedFiles.length > 0);
  }, [selectedFiles, form]);
  
  // Upload receipts function
  const uploadReceipts = async (timeEntryId: string, files: File[]) => {
    for (const file of selectedFiles) {
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
      
      // Create document record
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
      }
    }
  };
  
  // Submit time entry
  const submitTimeEntry = async (data: FormValues): Promise<{ id: string }> => {
    const timeEntry = {
      entity_type: data.entityType,
      entity_id: data.entityId,
      date_worked: format(data.workDate, 'yyyy-MM-dd'),
      start_time: data.startTime,
      end_time: data.endTime,
      hours_worked: data.hoursWorked,
      notes: data.notes || '',
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
  
  // Form submission handler
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Submit time entry
      const result = await submitTimeEntry(data);
      
      // Upload receipts if any
      if (selectedFiles.length > 0) {
        await uploadReceipts(result.id, selectedFiles);
      }
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      // Call success callback if provided
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
  
  // Handle next step
  const handleNext = async () => {
    const currentFields = currentStep === 1 
      ? ['entityType', 'entityId'] 
      : ['startTime', 'endTime', 'hoursWorked'];
    
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Handle receipt file selection
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setHasReceipts(files.length > 0);
  };
  
  // Handle file removal
  const handleFileClear = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setHasReceipts(newFiles.length > 0);
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select Entity */}
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
        
        {/* Step 2: Time Range Selection */}
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
              
              <div className="text-sm text-muted-foreground">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </div>
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
        
        {/* Step 3: Receipts */}
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
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
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
                />
              </div>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Navigation Buttons */}
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
