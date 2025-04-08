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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import EntityTypeSelector from './form/EntityTypeSelector';
import TimePickerMobile from './form/TimePickerMobile';
import { supabase } from '@/integrations/supabase/client';
import { useEntityData } from './hooks/useEntityData';
import ReceiptUploadManager from './form/ReceiptUploadManager';
import { useReceiptUpload } from './hooks/useReceiptUpload';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  date: Date;
}

export interface QuickLogFormValues {
  entityType: 'work_order' | 'project';
  entityId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes?: string;
  employeeId: string;
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  date
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const {
    hasReceipts,
    setHasReceipts,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateMetadata,
    validateReceiptData,
    reset: resetReceiptData
  } = useReceiptUpload();
  
  const { toast } = useToast();
  
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
      employeeId: ''
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
        resetReceiptData();
      }, 300);
    }
  }, [open, form, resetReceiptData]);
  
  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger(['entityType', 'entityId']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await form.trigger(['startTime', 'endTime', 'hoursWorked']);
      if (isValid) setStep(3);
    } else if (step === 3) {
      const isValid = await form.trigger(['employeeId']);
      if (isValid) setStep(4);
    }
  };
  
  const handleSubmit: SubmitHandler<QuickLogFormValues> = async (data) => {
    if (hasReceipts) {
      const validation = validateReceiptData();
      if (!validation.valid) {
        toast({
          title: "Receipt information required",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const timelogEntry = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        employee_id: data.employeeId,
        hours_worked: data.hoursWorked,
        date_worked: formattedDate,
        start_time: data.startTime,
        end_time: data.endTime,
        notes: data.notes || null,
        has_receipts: hasReceipts && selectedFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert(timelogEntry)
        .select('id')
        .single();
        
      if (error) throw error;
      
      if (hasReceipts && selectedFiles.length > 0 && timeEntry) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/time_entries/${timeEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }
          
          const documentMetadata = {
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            entity_type: 'TIME_ENTRY',
            entity_id: timeEntry.id,
            category: 'receipt',
            is_expense: true,
            tags: ['receipt', 'time-entry'],
            expense_type: receiptMetadata.expenseType || 'other',
            vendor_id: receiptMetadata.vendorId || null,
            vendor_type: receiptMetadata.vendorType || null,
            amount: receiptMetadata.amount || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: document, error: documentError } = await supabase
            .from('documents')
            .insert(documentMetadata)
            .select('document_id')
            .single();
            
          if (documentError) {
            console.error('Document error:', documentError);
            continue;
          }
          
          const { error: linkError } = await supabase
            .from('time_entry_document_links')
            .insert({
              time_entry_id: timeEntry.id,
              document_id: document.document_id,
              created_at: new Date().toISOString()
            });
            
          if (linkError) {
            console.error('Link error:', linkError);
          }
          
          if (data.entityType === 'work_order') {
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert({
                entity_type: 'WORK_ORDER',
                entity_id: data.entityId,
                description: `Time entry receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'TIME_RECEIPT',
                amount: receiptMetadata.amount || 0,
                document_id: document.document_id,
                time_entry_id: timeEntry.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                unit_price: receiptMetadata.amount || 0,
                quantity: 1,
                expense_date: new Date().toISOString(),
                vendor_id: receiptMetadata.vendorId || null
              });
            
            if (expenseError) {
              console.error('Error creating expense:', expenseError);
            }
          }
        }
      }
      
      toast({
        title: 'Time entry added',
        description: `${data.hoursWorked} hours have been logged for ${employees.find(e => e.employee_id === data.employeeId)?.name || 'employee'} on ${formattedDate}.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Log Time</SheetTitle>
        </SheetHeader>
        
        <div className="px-4 py-2 overflow-y-auto h-[calc(100vh-10rem)]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Select Work Item</div>
              
              <EntityTypeSelector 
                value={entityType} 
                onChange={(value) => {
                  form.setValue('entityType', value);
                  form.setValue('entityId', '');
                }}
              />
              
              <div className="space-y-2">
                <Label>Select {entityType === 'work_order' ? 'Work Order' : 'Project'}</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={entityId}
                  onChange={(e) => form.setValue('entityId', e.target.value)}
                >
                  <option value="">Select {entityType === 'work_order' ? 'a work order' : 'a project'}</option>
                  {entityType === 'work_order' ? (
                    workOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>{wo.name}</option>
                    ))
                  ) : (
                    projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
                {form.formState.errors.entityId && (
                  <p className="text-sm text-red-500">{form.formState.errors.entityId.message}</p>
                )}
              </div>
            </div>
          )}
          
          {step === 2 && (
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
                <Button variant="outline" className="w-full justify-start text-left">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(date, "MMMM d, yyyy")}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <TimePickerMobile
                    value={startTime}
                    onChange={(value) => form.setValue('startTime', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <TimePickerMobile
                    value={endTime}
                    onChange={(value) => form.setValue('endTime', value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md bg-muted p-3 flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Clock3 className="h-4 w-4 mr-2 text-[#0485ea]" />
                  <span>Total Hours</span>
                </div>
                <div className="font-medium">{form.watch('hoursWorked')}</div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about work performed..."
                  {...form.register('notes')}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Employee</div>
              
              <div className="rounded-md border p-4 mb-4">
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
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{format(date, "MMMM d, yyyy")} • {startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee" className="flex items-center">
                  Employee <span className="text-red-500 ml-1">*</span>
                </Label>
                <select
                  id="employee"
                  className={`w-full border ${form.formState.errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  {...form.register('employeeId')}
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
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-lg font-medium">Receipts & Expenses</div>
              
              <div className="rounded-md border p-4 mb-4">
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
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{format(date, "MMMM d, yyyy")} • {startTime} - {endTime} ({form.watch('hoursWorked')} hrs)</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>{employees.find(e => e.employee_id === form.watch('employeeId'))?.name || 'Employee'}</span>
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
                toggleLabel="Attach Receipt(s)"
              />
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-between">
          {step === 1 ? (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep(prev => prev - 1)}>
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
