
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onForceDelete?: () => void;
  error?: string | null;
  hasReferences?: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  open,
  onClose,
  onConfirm,
  onForceDelete,
  error,
  hasReferences = false
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {error ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Error
              </div>
            ) : (
              'Delete Document'
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {error ? (
              <div className="space-y-2">
                <p className="text-red-600">{error}</p>
                {hasReferences && (
                  <p>
                    This document is referenced by other records. Deleting it may cause data inconsistencies.
                  </p>
                )}
              </div>
            ) : (
              'This action cannot be undone. This will permanently delete the document from your system.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {error ? (
            hasReferences && onForceDelete ? (
              <AlertDialogAction 
                onClick={onForceDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Force Delete
              </AlertDialogAction>
            ) : null
          ) : (
            <AlertDialogAction 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation;
