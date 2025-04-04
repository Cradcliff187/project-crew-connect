
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Building, Briefcase, CreditCard, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TimeEntryFormValues, useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useTimeEntrySubmit } from './hooks/useTimeEntrySubmit';
import { useTimeEntryReceipts } from './hooks/useTimeEntryReceipts';
import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ReceiptUploader from './form/ReceiptUploader';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';
import { useEntityData } from './hooks/useEntityData';
import VendorSelector from '@/components/documents/vendor-selector';
import { Textarea } from '@/components/ui/textarea';

interface TimeEntryFormWizardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  date: Date;
}

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({
  onSuccess,
  onCancel,
  date
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasReceipts, setHasReceipts] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState({
    vendorId: '',
    expenseType: '',
    amount: undefined as number | undefined
  });
  
  // Initialize form with default values
  const form = useForm<TimeEntryFormValues>({
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      date: date,
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      notes: '',
      receipts: [] as File[]
    },
    resolver: zodResolver(
      z.object({
        entityType: z.enum(['work_order', 'project']),
        entityId: z.string().min(1, "Please select a work order or project"),
        date: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        hoursWorked: z.number().min(0.1, "Hours must be greater than 0"),
        notes: z.string().optional(),
        receipts: z.any().optional()
      })
    )
  });
  
  // Custom hooks
  const { entityData } = useTimeEntryForm(form.watch());
  const { submitTimeEntry } = useTimeEntrySubmit();
  const { uploadReceipts } = useTimeEntryReceipts();
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
  
  // Update receipt files when selected files change
  useEffect(() => {
    form.setValue('receipts', selectedFiles);
  }, [selectedFiles, form]);
  
  // Form submission handler
  const onSubmit: SubmitHandler<TimeEntryFormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting time entry:', data);
      
      // Convert form values to API format
      const timeEntryData = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        date_worked: format(data.date, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hours_worked: data.hoursWorked,
        notes: data.notes || '',
        // Add employee ID if available
        employee_id: employees.length > 0 ? employees[0].employee_id : undefined,
        location_data: null
      };
      
      console.log('Prepared time entry data:', timeEntryData);
      
      // Submit time entry
      const result = await submitTimeEntry(timeEntryData);
      
      console.log('Time entry submission result:', result);
      
      // Upload receipts if any
      if (selectedFiles.length > 0 && result.id) {
        console.log('Uploading receipts for time entry:', result.id);
        
        await uploadReceipts(
          result.id, 
          selectedFiles, 
          {
            vendorId: receiptMetadata.vendorId,
            expenseType: receiptMetadata.expenseType,
            amount: receiptMetadata.amount
          }
        );
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting time entry:', error);
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
                form.setValue('entityType', value as 'work_order' | 'project');
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
              />
            </div>
            
            {hasReceipts && (
              <div className="rounded-md border p-4">
                <div className="mb-3 font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-[#0485ea]" />
                  Receipt Details
                </div>
                
                <ReceiptMetadataForm
                  vendorId={receiptMetadata.vendorId}
                  expenseType={receiptMetadata.expenseType}
                  amount={receiptMetadata.amount}
                  onVendorChange={(value) => setReceiptMetadata(prev => ({ ...prev, vendorId: value }))}
                  onExpenseTypeChange={(value) => setReceiptMetadata(prev => ({ ...prev, expenseType: value }))}
                  onAmountChange={(value) => setReceiptMetadata(prev => ({ ...prev, amount: value }))}
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
