
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import { useEntityData } from './hooks/useEntityData';
import { useForm } from 'react-hook-form';
import { TimeEntryFormValues } from './hooks/useTimeEntryForm';
import TimeRangeSelector from './form/TimeRangeSelector';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ReceiptUploader from './form/ReceiptUploader';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  selectedDate: Date;
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  selectedDate
}) => {
  const [step, setStep] = useState(1);
  const [hasReceipts, setHasReceipts] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<TimeEntryFormValues>({
    defaultValues: {
      entityType: 'work_order' as 'work_order' | 'project',
      entityId: '',
      workDate: selectedDate,
      startTime: format(new Date().setMinutes(0), 'HH:00'),
      endTime: format(new Date().setHours(new Date().getHours() + 1).setMinutes(0), 'HH:00'),
      hoursWorked: 1,
      notes: '',
      employeeId: ''
    }
  });
  
  const { 
    workOrders, 
    projects, 
    isLoadingEntities, 
    getSelectedEntityDetails 
  } = useEntityData(form);

  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const hoursWorked = form.watch('hoursWorked');
  
  const selectedEntity = getSelectedEntityDetails();
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleNext = () => {
    if (step === 1 && !entityId) {
      form.setError('entityId', { 
        type: 'required', 
        message: `Please select a ${entityType === 'work_order' ? 'work order' : 'project'}` 
      });
      return;
    }
    
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async () => {
    try {
      await submitTimeEntry({
        entityType: entityType,
        entityId: entityId,
        workDate: selectedDate,
        startTime: startTime,
        endTime: endTime,
        hoursWorked: hoursWorked,
        notes: form.getValues('notes') || `Quick log entry for ${selectedEntity?.title || 'selected entity'}`,
        employeeId: form.getValues('employeeId') || ''
      }, selectedFiles);
      onOpenChange(false);
      setStep(1);
      form.reset({
        entityType: 'work_order',
        entityId: '',
        workDate: selectedDate,
        startTime: format(new Date().setMinutes(0), 'HH:00'),
        endTime: format(new Date().setHours(new Date().getHours() + 1).setMinutes(0), 'HH:00'),
        hoursWorked: 1,
        notes: '',
        employeeId: ''
      });
      setSelectedFiles([]);
      setHasReceipts(false);
    } catch (error) {
      console.error('Error submitting quick log:', error);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a {entityType === 'work_order' ? 'work order' : 'project'} to log time for.
            </p>
            
            <EntityTypeSelector 
              entityType={entityType} 
              onChange={(value) => form.setValue('entityType', value)} 
            />
            
            <EntitySelector
              entityType={entityType}
              entityId={entityId}
              workOrders={workOrders}
              projects={projects}
              isLoading={isLoadingEntities}
              onChange={(value) => form.setValue('entityId', value)}
              error={form.formState.errors.entityId?.message}
              selectedEntity={selectedEntity}
            />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleNext}
                className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
                disabled={!entityId}
              >
                Next
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set time details for {selectedEntity?.title || 'selected entity'}
            </p>
            
            <TimeRangeSelector
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={(value) => {
                form.setValue('startTime', value);
                // Recalculate hours
                const [startHour, startMinute] = value.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);
                
                let hours = endHour - startHour;
                let minutes = endMinute - startMinute;
                
                if (minutes < 0) {
                  hours -= 1;
                  minutes += 60;
                }
                
                if (hours < 0) {
                  hours += 24; // Handle overnight shifts
                }
                
                const totalHours = hours + (minutes / 60);
                form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
              }}
              onEndTimeChange={(value) => {
                form.setValue('endTime', value);
                // Recalculate hours
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = value.split(':').map(Number);
                
                let hours = endHour - startHour;
                let minutes = endMinute - startMinute;
                
                if (minutes < 0) {
                  hours -= 1;
                  minutes += 60;
                }
                
                if (hours < 0) {
                  hours += 24; // Handle overnight shifts
                }
                
                const totalHours = hours + (minutes / 60);
                form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
              }}
              startTimeError=""
              endTimeError=""
            />
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Total hours:</span>
              <span className="font-medium">{hoursWorked.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the work performed..."
                value={form.watch('notes')}
                onChange={(e) => form.setValue('notes', e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
              >
                Next
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Do you have any receipts to upload for this time entry?
            </p>
            
            <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div>
                <h4 className="font-medium">Attach Receipt(s)</h4>
                <p className="text-sm text-muted-foreground">
                  Toggle on to upload receipt images or documents
                </p>
              </div>
              <Switch
                checked={hasReceipts}
                onCheckedChange={setHasReceipts}
                className="data-[state=checked]:bg-[#0485ea]"
              />
            </div>
            
            {hasReceipts && (
              <ReceiptUploader
                selectedFiles={selectedFiles}
                onFilesSelected={handleFilesSelected}
                onFileClear={handleFileClear}
              />
            )}
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
              >
                Review
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <p className="font-medium text-lg">Review Time Entry</p>
            
            <div className="rounded-md border p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span className="text-sm capitalize">{entityType.replace('_', ' ')}</span>
                
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{selectedEntity?.title || entityId}</span>
                
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="text-sm">{format(selectedDate, 'MMMM d, yyyy')}</span>
                
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="text-sm">{startTime} - {endTime}</span>
                
                <span className="text-sm text-muted-foreground">Hours:</span>
                <span className="text-sm">{hoursWorked.toFixed(2)}</span>
                
                {form.watch('notes') && (
                  <>
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <span className="text-sm">{form.watch('notes')}</span>
                  </>
                )}
                
                <span className="text-sm text-muted-foreground">Receipts:</span>
                <span className="text-sm">{selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'None'}</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Time'}
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={(o) => {
      if (!o) {
        setStep(1);
        form.reset({
          entityType: 'work_order',
          entityId: '',
          workDate: selectedDate,
          startTime: format(new Date().setMinutes(0), 'HH:00'),
          endTime: format(new Date().setHours(new Date().getHours() + 1).setMinutes(0), 'HH:00'),
          hoursWorked: 1,
          notes: '',
          employeeId: ''
        });
        setSelectedFiles([]);
        setHasReceipts(false);
      }
      onOpenChange(o);
    }}>
      <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Time {step > 1 && selectedEntity?.title ? `- ${selectedEntity.title}` : ''}</SheetTitle>
        </SheetHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
