import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateHours } from '@/components/timeTracking/utils/timeUtils';
import TimeRangeSelector from '@/components/timeTracking/form/TimeRangeSelector';
import EmployeeSelector from '@/components/timeTracking/form/EmployeeSelector';
import ReceiptUploadManager from '@/components/timeTracking/form/ReceiptUploadManager';
import { useReceiptUpload } from '@/components/timeTracking/hooks/useReceiptUpload';

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  employees: { employee_id: string; name: string }[];
  onSuccess: () => void;
}

const TimelogAddSheet = ({
  open,
  onOpenChange,
  workOrderId,
  employees,
  onSuccess
}: TimelogAddSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workDate, setWorkDate] = useState<Date>(new Date());
  const [hoursWorked, setHoursWorked] = useState(8);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  
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
  
  const updateHoursWorked = (start: string, end: string) => {
    try {
      const hours = calculateHours(start, end);
      setHoursWorked(parseFloat(hours.toFixed(2)));
    } catch (error) {
      console.error('Error calculating hours:', error);
      setHoursWorked(0);
    }
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    updateHoursWorked(value, endTime);
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    updateHoursWorked(startTime, value);
  };

  const handleDateChange = (date: Date) => {
    setWorkDate(date);
  };
  
  const resetForm = () => {
    setStartTime('09:00');
    setEndTime('17:00');
    setWorkDate(new Date());
    setHoursWorked(8);
    setEmployeeId('');
    setNotes('');
    setEmployeeError('');
    setHasReceipts(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) {
      setEmployeeError('Please select an employee');
      toast({
        title: 'Employee required',
        description: 'Please select an employee for this time entry.',
        variant: 'destructive',
      });
      return;
    }
    
    if (hoursWorked <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter valid start and end times.',
        variant: 'destructive',
      });
      return;
    }
    
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
      const formattedDate = workDate.toISOString().split('T')[0];
      
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: employeeId,
        hours_worked: hoursWorked,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
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
          
          const { error: expenseError } = await supabase
            .from('expenses')
            .insert({
              entity_type: 'WORK_ORDER',
              entity_id: workOrderId,
              description: `Time entry receipt: ${file.name}`,
              expense_type: receiptMetadata.expenseType || 'TIME_RECEIPT',
              amount: receiptMetadata.amount || 0,
              document_id: document.document_id,
              time_entry_id: timeEntry.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              quantity: 1,
              unit_price: receiptMetadata.amount || 0,
              expense_date: new Date().toISOString()
            });
            
          if (expenseError) {
            console.error('Error creating expense for receipt:', expenseError);
          }
        }
      }
      
      toast({
        title: 'Time entry added',
        description: `${hoursWorked} hours have been logged for ${employees.find(e => e.employee_id === employeeId)?.name || 'employee'} on ${formattedDate}.`,
      });
      
      resetForm();
      onSuccess();
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
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log Time</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <EmployeeSelector 
            employees={employees}
            selectedEmployeeId={employeeId}
            onChange={(value) => {
              setEmployeeId(value);
              setEmployeeError('');
            }}
            error={employeeError}
          />
          
          <div className="space-y-2">
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              date={workDate}
              onDateChange={handleDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              hoursWorked={hoursWorked}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about work performed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <ReceiptUploadManager
            hasReceipts={hasReceipts}
            onHasReceiptsChange={setHasReceipts}
            files={selectedFiles}
            onFilesChange={handleFilesSelected}
            metadata={receiptMetadata}
            onMetadataChange={updateMetadata}
            entityType="work_order"
            entityId={workOrderId}
            showToggle={true}
            toggleLabel="Attach Receipt(s)"
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
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? 'Saving...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default TimelogAddSheet;
