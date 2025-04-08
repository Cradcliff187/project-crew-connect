
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Briefcase, Building, Clock, Camera, Clock3, Loader2, X, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import EntityTypeSelector from './form/EntityTypeSelector';
import TimePickerMobile from './form/TimePickerMobile';
import { supabase } from '@/integrations/supabase/client';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';
import { useEntityData } from './hooks/useEntityData';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  date: Date;
}

// Define the form values type
export interface QuickLogFormValues {
  entityType: 'work_order' | 'project';
  entityId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes?: string;
  employeeId: string; // Add required employee ID
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  date
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [hasReceipts, setHasReceipts] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | undefined>(undefined);
  
  const { toast } = useToast();
  
  // Update form schema to require employeeId
  const formSchema = z.object({
    entityType: z.enum(['work_order', 'project']),
    entityId: z.string().min(1, "Please select a work order or project"),
    startTime: z.string(),
    endTime: z.string(),
    hoursWorked: z.number().min(0.1),
    notes: z.string().optional(),
    employeeId: z.string().min(1, "Employee selection is required")
  });
  
  const form = useForm<QuickLogFormValues>({
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      notes: '',
      employeeId: '' // Default empty but required
    },
    resolver: zodResolver(formSchema)
  });
  
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
  
  // Reset form and state when sheet opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        form.reset({
          entityType: 'work_order',
          entityId: '',
          startTime: '09:00',
          endTime: '17:00',
          hoursWorked: 8,
          notes: '',
          employeeId: ''
        });
        setSelectedFiles([]);
        setHasReceipts(false);
        setVendorId('');
        setExpenseType('');
        setExpenseAmount(undefined);
      }, 300);
    }
  }, [open, form]);
  
  // Handle next step
  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger(['entityType', 'entityId']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await form.trigger(['startTime', 'endTime', 'hoursWorked']);
      if (isValid) setStep(3);
    } else if (step === 3) {
      const isValid = await form.trigger(['employeeId']); // Add employee validation
      if (isValid) setStep(4);
    }
  };
  
  // Handle back
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setHasReceipts(files.length > 0);
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setHasReceipts(newFiles.length > 0);
    
    if (newFiles.length === 0) {
      setVendorId('');
      setExpenseType('');
      setExpenseAmount(undefined);
    }
  };
  
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
          vendor_id: vendorId || null,
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
  const submitTimeEntry = async (data: QuickLogFormValues): Promise<{ id: string }> => {
    const timeEntry = {
      entity_type: data.entityType,
      entity_id: data.entityId,
      date_worked: format(date, 'yyyy-MM-dd'),
      start_time: data.startTime,
      end_time: data.endTime,
      hours_worked: data.hoursWorked,
      notes: data.notes || '',
      employee_id: data.employeeId, // Include employee_id
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
  
  // Handle form submission
  const onSubmit: SubmitHandler<QuickLogFormValues> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Submit time entry
      const result = await submitTimeEntry(data);
      
      // Upload receipts if any
      if (selectedFiles.length > 0) {
        await uploadReceipts(result.id, selectedFiles);
      }
      
      // Show success toast
      toast({
        title: "Time entry saved",
        description: `${data.hoursWorked} hours logged for ${selectedEntity?.name}`,
      });
      
      // Close sheet and call success callback
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting time entry:', error);
      
      toast({
        title: "Error saving time entry",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // File selection handler for input element
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files);
      handleFileSelect([...selectedFiles, ...fileArray]);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>
            {step === 1 ? 'Select Work Item' : 
             step === 2 ? 'Time Details' : 
             step === 3 ? 'Select Employee' :
             'Add Receipt (Optional)'}
          </SheetTitle>
        </SheetHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 1: Entity Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <EntityTypeSelector
                value={entityType}
                onChange={(value) => {
                  form.setValue('entityType', value);
                  form.setValue('entityId', '');
                }}
              />
              
              <div className="space-y-2">
                <Label>Select {entityType === 'work_order' ? 'Work Order' : 'Project'}</Label>
                {isLoadingEntities ? (
                  <div className="h-10 flex items-center px-3 border rounded-md text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0485ea]/20 focus:border-[#0485ea]"
                    value={entityId}
                    onChange={(e) => form.setValue('entityId', e.target.value)}
                  >
                    <option value="">Select {entityType === 'work_order' ? 'Work Order' : 'Project'}</option>
                    {(entityType === 'work_order' ? workOrders : projects).map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                )}
                {form.formState.errors.entityId && (
                  <div className="text-sm text-red-500">
                    {form.formState.errors.entityId.message}
                  </div>
                )}
              </div>
              
              {entityId && selectedEntity && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <div className="font-medium">
                    {entityType === 'work_order' ? (
                      <div className="flex items-center">
                        <Briefcase className="h-3.5 w-3.5 mr-1.5 text-[#0485ea]" />
                        {selectedEntity.name}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Building className="h-3.5 w-3.5 mr-1.5 text-[#0485ea]" />
                        {selectedEntity.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Time Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="flex items-center mb-2">
                  {entityType === 'work_order' ? (
                    <Briefcase className="h-4 w-4 mr-2 text-[#0485ea]" />
                  ) : (
                    <Building className="h-4 w-4 mr-2 text-[#0485ea]" />
                  )}
                  <span className="font-medium">{selectedEntity?.name}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TimePickerMobile
                    value={startTime}
                    onChange={(value) => form.setValue('startTime', value)}
                    label="Start Time"
                  />
                  
                  <TimePickerMobile
                    value={endTime}
                    onChange={(value) => form.setValue('endTime', value)}
                    label="End Time"
                  />
                </div>
                
                <div className="rounded-md bg-muted p-3 flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
                    <span>Total Hours</span>
                  </div>
                  <div className="font-medium">{form.watch('hoursWorked')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any details about this time entry"
                  {...form.register('notes')}
                  className="h-20"
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Employee Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="flex items-center mb-2">
                  {entityType === 'work_order' ? (
                    <Briefcase className="h-4 w-4 mr-2 text-[#0485ea]" />
                  ) : (
                    <Building className="h-4 w-4 mr-2 text-[#0485ea]" />
                  )}
                  <span className="font-medium">{selectedEntity?.name}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>{startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeId">Select Employee <span className="text-red-500">*</span></Label>
                {isLoadingEntities ? (
                  <div className="h-10 flex items-center px-3 border rounded-md text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Employees...
                  </div>
                ) : (
                  <select
                    id="employeeId"
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0485ea]/20 focus:border-[#0485ea]"
                    {...form.register('employeeId')}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                )}
                {form.formState.errors.employeeId && (
                  <div className="text-sm text-red-500">
                    {form.formState.errors.employeeId.message}
                  </div>
                )}
              </div>
              
              {form.watch('employeeId') && employees.find(e => e.employee_id === form.watch('employeeId')) && (
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#0485ea]" />
                    <span className="font-medium">
                      {employees.find(e => e.employee_id === form.watch('employeeId'))?.name}
                    </span>
                  </div>
                  {employees.find(e => e.employee_id === form.watch('employeeId'))?.hourly_rate && (
                    <div className="text-sm text-muted-foreground mt-1 ml-6">
                      Rate: ${employees.find(e => e.employee_id === form.watch('employeeId'))?.hourly_rate?.toFixed(2)}/hr
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Receipt Upload */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="flex items-center mb-2">
                  {entityType === 'work_order' ? (
                    <Briefcase className="h-4 w-4 mr-2 text-[#0485ea]" />
                  ) : (
                    <Building className="h-4 w-4 mr-2 text-[#0485ea]" />
                  )}
                  <span className="font-medium">{selectedEntity?.name}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>{startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                </div>
                
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span>{employees.find(e => e.employee_id === form.watch('employeeId'))?.name}</span>
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <p className="text-sm mb-3">
                  Upload receipts for expenses related to this time entry.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select Files
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCamera(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
                
                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Selected Files:</p>
                    
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border rounded-md p-2 text-sm"
                        >
                          <div className="truncate">{file.name}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Receipt Metadata */}
                {hasReceipts && (
                  <div className="space-y-3 border-t pt-3">
                    <p className="text-sm font-medium">Receipt Details:</p>
                    
                    <div className="space-y-3">
                      <VendorSelector
                        vendorType="vendor"
                        value={vendorId}
                        onChange={setVendorId}
                        showAddNewOption={true}
                        label="Vendor"
                      />
                      
                      <div className="space-y-2">
                        <Label>Expense Type</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0485ea]/20 focus:border-[#0485ea]"
                          value={expenseType}
                          onChange={(e) => setExpenseType(e.target.value)}
                        >
                          <option value="">Select expense type</option>
                          <option value="MATERIALS">Materials</option>
                          <option value="TOOLS">Tools & Equipment</option>
                          <option value="FUEL">Fuel</option>
                          <option value="MEALS">Meals & Entertainment</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={expenseAmount || ''}
                          onChange={(e) => setExpenseAmount(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-2 sticky bottom-0 bg-background pb-2">
            {step === 1 ? (
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
            ) : (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            
            {step < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
