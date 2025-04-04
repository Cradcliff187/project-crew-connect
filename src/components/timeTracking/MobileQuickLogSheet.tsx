
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
  const form = useForm<TimeEntryFormValues>({
    defaultValues: {
      entityType: 'work_order' as 'work_order' | 'project',
      entityId: '',
      workDate: selectedDate,
      startTime: '',
      endTime: '',
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
  
  const selectedEntity = getSelectedEntityDetails();
  
  const handleSubmit = async () => {
    if (!entityId) {
      // Show validation error
      form.setError('entityId', { 
        type: 'required', 
        message: `Please select a ${entityType === 'work_order' ? 'work order' : 'project'}` 
      });
      return;
    }
    
    // Create a simplified time entry with just 1 hour logged
    const data = {
      entityType: entityType,
      entityId: entityId,
      workDate: selectedDate,
      // Use current time rounded to the nearest 15 minutes
      startTime: format(new Date(), 'HH:00'), 
      endTime: format(new Date(new Date().setHours(new Date().getHours() + 1)), 'HH:00'),
      hoursWorked: 1,
      notes: `Quick log entry for ${selectedEntity?.title || 'selected entity'}`,
      employeeId: ''
    };
    
    try {
      await submitTimeEntry(data, []); // No receipts in quick log
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting quick log:', error);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Log Time</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Quickly log 1 hour of work for today ({format(selectedDate, 'MMM d, yyyy')})
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
          
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !entityId}
              className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
            >
              {isSubmitting ? 'Logging...' : 'Log 1 Hour'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
