
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { TimeEntry } from '@/types/timeTracking';

interface TimeEntryDeleteDialogProps {
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const formatDate = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
};

const TimeEntryDeleteDialog: React.FC<TimeEntryDeleteDialogProps> = ({
  timeEntry,
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}) => {
  if (!timeEntry) return null;

  const entityName = timeEntry.entity_name || 
    `${timeEntry.entity_type.charAt(0).toUpperCase() + timeEntry.entity_type.slice(1)} ${timeEntry.entity_id.slice(0, 8)}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the time entry for <strong>{entityName}</strong> on {formatDate(timeEntry.date_worked)}?
            
            <div className="mt-2 text-sm">
              <span className="block">
                <strong>Time:</strong> {format(timeEntry.start_time, 'h:mm a')} - {format(timeEntry.end_time, 'h:mm a')}
              </span>
              <span className="block">
                <strong>Hours:</strong> {timeEntry.hours_worked}
              </span>
              {timeEntry.notes && (
                <span className="block">
                  <strong>Notes:</strong> {timeEntry.notes}
                </span>
              )}
            </div>
            
            <div className="mt-2 text-destructive font-medium">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimeEntryDeleteDialog;
