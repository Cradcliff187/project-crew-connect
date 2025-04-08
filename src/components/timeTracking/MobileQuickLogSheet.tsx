
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateHours } from './utils/timeUtils';
import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import { useEntityData } from './hooks/useEntityData';
import { useReceiptUpload } from './hooks/useReceiptUpload';
import ReceiptUploadManager from './form/ReceiptUploadManager';
import EmployeeSelector from './form/EmployeeSelector';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  date?: Date;
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  date = new Date()
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityType, setEntityType] = useState<'work_order' | 'project'>('work_order');
  const [entityId, setEntityId] = useState('');
  const [workDate, setWorkDate] = useState(date);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [hoursWorked, setHoursWorked] = useState(9);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Receipt upload handling with our custom hook
  const {
    hasReceipts,
    setHasReceipts,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateMetadata,
    validateReceiptData
  } = useReceiptUpload({ 
    initialHasReceipts: false,
    initialMetadata: {}
  });
  
  // Get entity data using our custom hook
  const { workOrders, projects, employees, isLoadingEntities } = useEntityData();
  
  // Update hours worked when time changes
  useEffect(() => {
    try {
      const hours = calculateHours(startTime, endTime);
      setHoursWorked(parseFloat(hours.toFixed(2)));
    } catch (error) {
      console.error('Error calculating hours:', error);
      setHoursWorked(0);
    }
  }, [startTime, endTime]);
  
  // Reset form when closing sheet
  const resetForm = () => {
    setEntityType('work_order');
    setEntityId('');
    setWorkDate(new Date());
    setStartTime('08:00');
    setEndTime('17:00');
    setHoursWorked(9);
    setEmployeeId('');
    setNotes('');
    setHasReceipts(false);
    setErrors({});
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!entityId) {
      newErrors.entityId = 'Please select a work order or project';
    }
    
    if (!employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    
    if (hoursWorked <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit time entry and receipts to database
  const handleSubmit = async () => {
    // Validate form data
    if (!validateForm()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate receipt data if applicable
    if (hasReceipts) {
      const validation = validateReceiptData();
      if (!validation.valid) {
        toast({
          title: 'Receipt information required',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Get employee rate if available
      let employeeRate = null;
      try {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      } catch (error) {
        console.error('Error getting employee rate:', error);
      }
      
      // Create time entry
      const timeEntryData = {
        entity_type: entityType,
        entity_id: entityId,
        date_worked: format(workDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        hours_worked: hoursWorked,
        employee_id: employeeId,
        employee_rate: employeeRate,
        has_receipts: hasReceipts && selectedFiles.length > 0,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert time entry
      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Create labor expense
      if (timeEntry && hoursWorked > 0) {
        const hourlyRate = employeeRate || 75;
        const totalAmount = hoursWorked * hourlyRate;
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: entityType.toUpperCase(),
            entity_id: entityId,
            description: `Labor: ${hoursWorked} hours`,
            expense_type: 'LABOR',
            amount: totalAmount,
            time_entry_id: timeEntry.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: hoursWorked,
            unit_price: hourlyRate,
            expense_date: format(workDate, 'yyyy-MM-dd')
          });
          
        if (laborExpenseError) {
          console.error('Error creating labor expense:', laborExpenseError);
        }
      }
      
      // Handle receipt uploads if any
      if (hasReceipts && selectedFiles.length > 0 && timeEntry) {
        for (const file of selectedFiles) {
          try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `receipts/time_entries/${timeEntry.id}/${fileName}`;
            
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
                entity_id: timeEntry.id,
                category: 'receipt',
                is_expense: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expense_type: receiptMetadata.expenseType || null,
                vendor_id: receiptMetadata.vendorId || null,
                amount: receiptMetadata.amount || null,
                expense_date: receiptMetadata.expenseDate ? format(receiptMetadata.expenseDate, 'yyyy-MM-dd') : format(workDate, 'yyyy-MM-dd'),
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
                time_entry_id: timeEntry.id,
                document_id: document.document_id,
                created_at: new Date().toISOString()
              });
              
            if (linkError) {
              console.error('Error linking document to time entry:', linkError);
            }
            
            // Create expense record for the receipt
            const { error: expenseError } = await supabase
              .from('expenses')
              .insert({
                entity_type: entityType.toUpperCase(),
                entity_id: entityId,
                description: `Time entry receipt: ${file.name}`,
                expense_type: receiptMetadata.expenseType || 'OTHER',
                amount: receiptMetadata.amount || 0,
                document_id: document.document_id,
                time_entry_id: timeEntry.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                quantity: 1,
                unit_price: receiptMetadata.amount || 0,
                expense_date: receiptMetadata.expenseDate ? format(receiptMetadata.expenseDate, 'yyyy-MM-dd') : format(workDate, 'yyyy-MM-dd'),
                vendor_id: receiptMetadata.vendorId || null,
                is_receipt: true
              });
              
            if (expenseError) {
              console.error('Error creating expense for receipt:', expenseError);
            }
          } catch (err) {
            console.error('Error processing receipt:', err);
          }
        }
      }
      
      // Show success message
      toast({
        title: 'Time entry added',
        description: `${hoursWorked} hours have been logged successfully.`,
      });
      
      // Reset form and close sheet
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render compact employee selector
  const renderEmployeeSelector = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="employee" className="text-sm font-medium">
          Employee <span className="text-red-500">*</span>
        </Label>
        <select
          id="employee"
          className={`w-full border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white text-sm`}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map(employee => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.name}
            </option>
          ))}
        </select>
        {errors.employeeId && (
          <p className="text-xs text-red-500">{errors.employeeId}</p>
        )}
      </div>
    );
  };
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Time Entry</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          <EntityTypeSelector
            value={entityType}
            onChange={(value) => {
              setEntityType(value);
              setEntityId('');
            }}
          />
          
          <EntitySelector
            entityType={entityType}
            entityId={entityId}
            workOrders={workOrders}
            projects={projects}
            isLoading={isLoadingEntities}
            onChange={setEntityId}
            error={errors.entityId}
          />
          
          <EmployeeSelector 
            employees={employees}
            selectedEmployeeId={employeeId}
            onChange={(value) => {
              setEmployeeId(value);
              setErrors({...errors, employeeId: ''});
            }}
            error={errors.employeeId}
            compact={true}
          />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0485ea]" />
              <Label className="text-sm font-medium">Date & Time</Label>
            </div>
            
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              date={workDate}
              onDateChange={setWorkDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              hoursWorked={hoursWorked}
              error={errors.hours}
            />
          </div>
          
          {/* Simplified receipt upload manager for mobile */}
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
            toggleLabel="Add Receipt(s)"
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Log Time'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
