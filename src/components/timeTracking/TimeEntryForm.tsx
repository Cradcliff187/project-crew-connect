
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatTimeRange } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ConfirmationDialog from './form/ConfirmationDialog';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';
import EnhancedDocumentUpload from '../documents/EnhancedDocumentUpload';
import { EntityType } from '../documents/schemas/documentSchema';

interface TimeEntryFormProps {
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSuccess }) => {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  const {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    selectedFiles,
    handleFilesSelected,
    handleFileClear,
    confirmationData,
    handleSubmit,
    confirmSubmit,
    hasReceipts,
    setHasReceipts
  } = useTimeEntryForm(onSuccess);

  const {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);

  // Watch form values
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const hoursWorked = form.watch('hoursWorked');

  const handleReceiptUploadSuccess = () => {
    setShowReceiptUpload(false);
    toast({
      title: "Receipt uploaded",
      description: "Your receipt has been added to this time entry."
    });
  };

  // Direct receipt upload handler for the confirmation dialog
  const handleDirectReceiptUpload = () => {
    setShowReceiptUpload(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Entity Type Selection */}
            <EntityTypeSelector 
              entityType={entityType} 
              onChange={(value) => form.setValue('entityType', value, { shouldValidate: true })}
            />
            
            {/* Entity Selection */}
            <EntitySelector
              entityType={entityType}
              entityId={entityId}
              workOrders={workOrders}
              projects={projects}
              isLoading={isLoadingEntities}
              onChange={(value) => form.setValue('entityId', value, { shouldValidate: true })}
              error={form.formState.errors.entityId?.message}
              selectedEntity={getSelectedEntityDetails()}
            />
            
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <select
                id="employee"
                className="w-full border border-gray-300 rounded-md p-2"
                value={form.watch('employeeId') || ''}
                onChange={(e) => form.setValue('employeeId', e.target.value, { shouldValidate: true })}
              >
                {employees.map(employee => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Selection */}
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
            
            {/* Time Range */}
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
                  // Automatically adjust end time if needed
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
            
            {/* Total Hours */}
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
            
            {/* Notes */}
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
              {isLoading ? 'Processing...' : 'Review & Submit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        confirmationData={confirmationData}
        employees={employees}
        entityType={entityType}
        workOrders={workOrders}
        projects={projects}
        selectedFiles={selectedFiles}
        isLoading={isLoading}
        onConfirm={confirmSubmit}
        onUploadReceipts={handleDirectReceiptUpload}
        hasReceipts={hasReceipts}
        setHasReceipts={setHasReceipts}
        handleFilesSelected={handleFilesSelected}
        handleFileClear={handleFileClear}
      />

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptUpload} onOpenChange={setShowReceiptUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Receipt(s)</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType={entityType === 'work_order' ? 'WORK_ORDER' as EntityType : 'PROJECT' as EntityType}
            entityId={entityId}
            onSuccess={handleReceiptUploadSuccess}
            onCancel={() => setShowReceiptUpload(false)}
            isReceiptUpload={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryForm;
