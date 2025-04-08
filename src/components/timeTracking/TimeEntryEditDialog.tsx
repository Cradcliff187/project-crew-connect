
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TimeEntry } from '@/types/timeTracking';
import TimeEntryForm from './TimeEntryForm';

interface TimeEntryEditDialogProps {
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (timeEntry: TimeEntry) => Promise<void>;
  isSaving: boolean;
}

const TimeEntryEditDialog: React.FC<TimeEntryEditDialogProps> = ({ 
  timeEntry, 
  open, 
  onOpenChange, 
  onSave, 
  isSaving 
}) => {
  if (!timeEntry) return null;

  const handleSave = async (values: Partial<TimeEntry>) => {
    if (!timeEntry) return;
    
    // Handle the special "none" value for employee_id
    let updatedValues = {...values};
    if (updatedValues.employee_id === 'none') {
      updatedValues.employee_id = null;
    }

    await onSave({
      ...timeEntry,
      ...updatedValues
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>

        <TimeEntryForm
          initialValues={{
            ...timeEntry,
            // Convert null employee_id to the special "none" value for the form
            employee_id: timeEntry.employee_id || 'none'
          }}
          onSubmit={handleSave}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSaving}
          title="Edit Time Entry"
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryEditDialog;
