import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Building,
  Briefcase,
  CreditCard,
  Clock,
  Loader2,
  UserRound,
  CalendarIcon,
} from 'lucide-react';
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
import { calculateHours } from './utils/timeUtils';
import { DatePicker } from '@/components/ui/date-picker';
import { Employee } from '@/types/common';
import EmployeeSelect from './form/EmployeeSelect';
import { TimeEntry } from '@/types/timeTracking';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, 'Please select a work order or project'),
  workDate: z.date(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  hoursWorked: z.number().min(0.01, 'Hours must be greater than 0'),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
  hasReceipts: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
  onCancel?: () => void;
  date: Date;
  initialData?: TimeEntry | null;
}

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({
  onSuccess,
  onCancel,
  date,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasReceipts, setHasReceipts] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [vendor, setVendor] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | undefined>(undefined);
  const [timeError, setTimeError] = useState('');

  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      entityType: initialData?.entity_type || 'work_order',
      entityId: initialData?.entity_id || '',
      workDate: initialData ? new Date(initialData.date_worked) : date,
      startTime: initialData?.start_time || '09:00',
      endTime: initialData?.end_time || '17:00',
      hoursWorked: initialData?.hours_worked || 8,
      notes: initialData?.notes || '',
      employeeId: initialData?.employee_id || '',
      hasReceipts: initialData?.has_receipts || false,
    },
    resolver: zodResolver(formSchema),
  });

  const { workOrders, projects, employees, isLoadingEntities, getSelectedEntityDetails } =
    useEntityData(form);

  console.log('[TimeEntryFormWizard] Employees received from useEntityData:', employees);

  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');

  const selectedEntity = entityId ? getSelectedEntityDetails() : null;

  useEffect(() => {
    if (startTime && endTime) {
      try {
        const hours = calculateHours(startTime, endTime);
        if (hours <= 0) {
          setTimeError('End time must be after start time');
          form.setValue('hoursWorked', 0);
        } else {
          setTimeError('');
          form.setValue('hoursWorked', parseFloat(hours.toFixed(2)));
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
          tags: ['receipt', 'time-entry'],
        })
        .select('document_id')
        .single();

      if (documentError) {
        console.error('Error creating document record:', documentError);
        continue;
      }

      const { error: linkError } = await supabase.from('time_entry_document_links').insert({
        time_entry_id: timeEntryId,
        document_id: document.document_id,
        created_at: new Date().toISOString(),
      });

      if (linkError) {
        console.error('Error linking document to time entry:', linkError);
      }
    }
  };

  // Function to prepare data for DB insert/update
  const prepareTimeEntryData = (data: FormValues) => {
    const employeeData = employees.find(e => e.id === data.employeeId);
    return {
      entity_type: data.entityType,
      entity_id: data.entityId,
      employee_id: data.employeeId || null,
      date_worked: format(data.workDate, 'yyyy-MM-dd'),
      start_time: data.startTime,
      end_time: data.endTime,
      hours_worked: data.hoursWorked,
      notes: data.notes || '',
      has_receipts: selectedFiles.length > 0,
      cost_rate: employeeData?.cost_rate ?? null, // Get rate from fetched employee data
      bill_rate: employeeData?.bill_rate ?? null,
      updated_at: new Date().toISOString(), // Always set updated_at
      location_data: null,
    };
  };

  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (timeError) {
      toast({
        title: 'Invalid time range',
        description: timeError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // --- UPDATE ---
        const updateData = prepareTimeEntryData(data);
        // Remove fields that shouldn't be updated directly or are immutable
        delete (updateData as any).created_at;

        console.log('[TimeEntryFormWizard] Updating Time Entry:', initialData.id, updateData);
        const { error } = await supabase
          .from('time_entries')
          .update(updateData)
          .eq('id', initialData.id);

        if (error) throw error;

        // TODO: Handle receipt updates/deletions - more complex logic needed here
        // For now, assume receipts are only added on create

        toast({
          title: 'Time entry updated',
          description: 'Your time entry has been successfully updated.',
        });
      } else {
        // --- INSERT ---
        const insertData = prepareTimeEntryData(data);
        console.log('[TimeEntryFormWizard] Submitting Time Entry Data:', insertData);

        const { data: result, error } = await supabase
          .from('time_entries')
          .insert(insertData)
          .select('id')
          .single();

        if (error) throw error;

        if (selectedFiles.length > 0) {
          await uploadReceipts(result.id, selectedFiles);
        }
        toast({
          title: 'Time entry submitted',
          description: 'Your time entry has been successfully recorded.',
        });
      }

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
    const currentFields =
      currentStep === 1 ? ['entityType', 'entityId'] : ['startTime', 'endTime', 'hoursWorked'];

    const isValid = await form.trigger(currentFields as any);

    if (isValid && !timeError) {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Select Work Item</div>

              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <EntityTypeSelector
                        value={field.value}
                        onChange={value => {
                          field.onChange(value);
                          form.setValue('entityId', '');
                          console.log(`Entity type changed to: ${value}`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <EntitySelector
                        entityType={entityType}
                        entityId={field.value}
                        workOrders={workOrders}
                        projects={projects}
                        isLoading={isLoadingEntities}
                        onChange={value => {
                          field.onChange(value);
                          console.log(`Selected entity ID: ${value}`);
                        }}
                        error={form.formState.errors.entityId?.message}
                        selectedEntity={
                          selectedEntity
                            ? {
                                name: selectedEntity.name,
                                location:
                                  selectedEntity.type === 'work_order'
                                    ? 'Location info'
                                    : undefined,
                              }
                            : null
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
                      <EmployeeSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        employees={employees}
                        disabled={isLoadingEntities || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {projects.length === 0 && workOrders.length === 0 && !isLoadingEntities && (
                <div className="rounded-md bg-warning-50 p-4 text-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-warning-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-warning-800">No work items found</h3>
                      <div className="mt-2 text-warning-700">
                        There are no active projects or work orders in the database. Please create
                        at least one project or work order first.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {form.formState.errors.entityId && (
                <div className="text-sm text-red-500">{form.formState.errors.entityId.message}</div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Time Details</div>

              <div className="rounded-md border p-4">
                <div className="flex items-center mb-3">
                  {entityType === 'work_order' ? (
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  ) : (
                    <Building className="h-5 w-5 mr-2 text-primary" />
                  )}
                  <span className="font-medium">{selectedEntity?.name}</span>
                  {form.watch('employeeId') && employees && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (
                      {
                        employees.find(
                          e =>
                            e.id === form.watch('employeeId') ||
                            e.employee_id === form.watch('employeeId')
                        )?.name
                      }
                      )
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="workDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <TimeRangeSelector
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={value => form.setValue('startTime', value)}
                onEndTimeChange={value => form.setValue('endTime', value)}
                error={timeError}
                hoursWorked={form.watch('hoursWorked')}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional details about this time entry"
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Receipts & Expenses</div>

              <div className="rounded-md border p-4">
                <div className="flex items-center mb-3">
                  {entityType === 'work_order' ? (
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  ) : (
                    <Building className="h-5 w-5 mr-2 text-primary" />
                  )}
                  <span className="font-medium">{selectedEntity?.name}</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {startTime} - {endTime} ({form.watch('hoursWorked')} hrs)
                  </span>
                </div>

                {form.watch('employeeId') && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <UserRound className="h-4 w-4 mr-1" />
                    <span>
                      {
                        employees.find(
                          e =>
                            e.id === form.watch('employeeId') ||
                            e.employee_id === form.watch('employeeId')
                        )?.name
                      }
                    </span>
                  </div>
                )}
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
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
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
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting || (currentStep === 2 && !!timeError)}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default TimeEntryFormWizard;
