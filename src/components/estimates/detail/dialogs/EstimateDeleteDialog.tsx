import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface EstimateDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

const EstimateDeleteDialog: React.FC<EstimateDeleteDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this estimate. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EstimateDeleteDialog;
