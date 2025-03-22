
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Timer, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatTimeRange } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ConfirmationDialog from './form/ConfirmationDialog';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';
import { ReceiptUploadDialog } from './dialogs/ReceiptDialog';
import { EntityType } from '../documents/schemas/documentSchema';

interface TimeEntryFormProps {
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSuccess }) => {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedEmployeeRate, setSelectedEmployeeRate] = useState<number | null>(null);

  const {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    confirmationData,
    handleSubmit,
    confirmSubmit,
    newTimeEntryId,
    setNewTimeEntryId
  } = useTimeEntryForm(onSuccess);

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
  const hoursWorked = form.watch('hoursWorked');
  const employeeId = form.watch('employeeId');

  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const employee = employees.find(emp => emp.employee_id === employeeId);
      setSelectedEmployeeRate(employee?.hourly_rate || null);
    } else {
      setSelectedEmployeeRate(null);
    }
  }, [employeeId, employees]);

  // Handle receipt upload success
  const handleReceiptUploadSuccess = async (timeEntryId: string, documentId: string) => {
    try {
      // Update the time entry to mark it as having receipts
      const { error } = await supabase
        .from('time_entries')
        .update({ has_receipts: true })
        .eq('id', timeEntryId);
        
      if (error) throw error;
      
      setShowReceiptUpload(false);
      toast({
        title: "Receipt uploaded",
        description: "Your receipt has been added to this time entry."
      });
      
      // Redirect to the time entries list
      onSuccess();
    } catch (error) {
      console.error("Error updating time entry with receipt:", error);
      toast({
        title: "Error",
        description: "Failed to link receipt to time entry.",
        variant: "destructive"
      });
    }
  };

  // Handle confirmation with receipt
  const handleConfirmWithReceipt = () => {
    // First submit the time entry
    confirmSubmit().then((timeEntryId) => {
      if (timeEntryId) {
        setNewTimeEntryId(timeEntryId);
        setShowConfirmDialog(false);
        setShowReceiptUpload(true);
      }
    });
  };

  // Handle confirmation without receipt
  const handleConfirmWithoutReceipt = () => {
    confirmSubmit().then(() => {
      onSuccess();
    });
  };

  const laborCost = hoursWorked * (selectedEmployeeRate || 75);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <EntityTypeSelector 
              entityType={entityType} 
              onChange={(value) => form.setValue('entityType', value, { shouldValidate: true })}
            />
            
            <EntitySelector
              entityType={entityType}
              entityId={entityId}
              workOrders={workOrders}
              projects={projects}
              isLoading={isLoadingEntities}
              onChange={(value) => form.setValue('entityId', value, { shouldValidate: true })}
              error={form.formState.errors.entityId?.message}
              selectedEntity={getSelectedEntityDetails()}
              required={true}
            />
            
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <select
                id="employee"
                className="w-full border border-gray-300 rounded-md p-2"
                value={employeeId || ''}
                onChange={(e) => form.setValue('employeeId', e.target.value, { shouldValidate: true })}
              >
                {employees.map(employee => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name} {employee.hourly_rate ? `- $${employee.hourly_rate}/hr` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('workDate') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('workDate') ? (
                      format(form.watch('workDate'), "MMMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch('workDate')}
                    onSelect={(date) => date && form.setValue('workDate', date, { shouldValidate: true })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Time Range</Label>
                {startTime && endTime && (
                  <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Timer className="h-3.5 w-3.5 mr-1" />
                    <span>Duration: {hoursWorked.toFixed(2)} hours</span>
                  </div>
                )}
              </div>
              
              <TimeRangeSelector
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(value) => {
                  form.setValue('startTime', value, { shouldValidate: true });
                  if (endTime) {
                    const [startHour, startMinute] = value.split(':').map(Number);
                    const [endHour, endMinute] = endTime.split(':').map(Number);
                    const startTotal = startHour * 60 + startMinute;
                    const endTotal = endHour * 60 + endMinute;
                    
                    if (endTotal <= startTotal && endTotal > startTotal - 120) {
                      let newEndHour = startHour + 1;
                      if (newEndHour >= 24) newEndHour -= 24;
                      const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                      form.setValue('endTime', newEndTime, { shouldValidate: true });
                    }
                  }
                }}
                onEndTimeChange={(value) => form.setValue('endTime', value, { shouldValidate: true })}
                startTimeError={form.formState.errors.startTime?.message}
                endTimeError={form.formState.errors.endTime?.message}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Total Hours</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.01"
                  readOnly
                  value={hoursWorked}
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="laborCost">Estimated Labor Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input
                    id="laborCost"
                    type="text"
                    readOnly
                    value={laborCost.toFixed(2)}
                    className="bg-muted pl-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Based on {selectedEmployeeRate ? `$${selectedEmployeeRate.toFixed(2)}` : '$75.00'}/hr
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the work performed..."
                {...form.register('notes')}
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Time Entry'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        confirmationData={confirmationData}
        employees={employees}
        entityType={entityType}
        workOrders={workOrders}
        projects={projects}
        isLoading={isLoading}
        onConfirmWithReceipt={handleConfirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />

      {showReceiptUpload && newTimeEntryId && (
        <ReceiptUploadDialog
          open={showReceiptUpload}
          timeEntry={newTimeEntryId ? {
            id: newTimeEntryId,
            entity_id: entityId,
            entity_type: entityType,
            date_worked: form.watch('workDate').toISOString(),
            vendor_id: null
          } as any}
          onSuccess={handleReceiptUploadSuccess}
          onCancel={() => {
            setShowReceiptUpload(false);
            onSuccess();
          }}
        />
      )}
    </div>
  );
};

export default TimeEntryForm;
