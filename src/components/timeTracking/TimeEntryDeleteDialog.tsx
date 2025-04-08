
import React from 'react';
import { TimeEntry } from '@/types/timeTracking';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatTime } from './utils/timeUtils';
import { Loader2 } from 'lucide-react';

interface TimeEntryDeleteDialogProps {
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const TimeEntryDeleteDialog: React.FC<TimeEntryDeleteDialogProps> = ({
  timeEntry,
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}) => {
  if (!timeEntry) return null;

  const handleDelete = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this time entry from {timeEntry.date_worked}?
            {timeEntry.employee_name && (
              <>
                <br/>
                Employee: <strong>{timeEntry.employee_name}</strong>
              </>
            )}
            <br/>
            Time: <strong>{formatTime(timeEntry.start_time)} - {formatTime(timeEntry.end_time)}</strong>
            <br/>
            Hours: <strong>{timeEntry.hours_worked?.toFixed(1)}</strong>
            <br/>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimeEntryDeleteDialog;
