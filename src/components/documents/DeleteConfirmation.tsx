
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
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onForceDelete?: () => void;
  error?: string | null;
  hasReferences?: boolean;
  isLoading?: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  open,
  onClose,
  onConfirm,
  onForceDelete,
  error,
  hasReferences = false,
  isLoading = false
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
            ) : hasReferences ? (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Document Has References
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Delete Document
              </div>
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
            ) : hasReferences ? (
              <div className="space-y-2">
                <p>
                  This document is referenced by other records in the system, such as estimates, 
                  work orders, or expenses.
                </p>
                <div className="flex items-start mt-2 bg-amber-50 p-3 rounded-md">
                  <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Deleting this document may cause data inconsistencies. 
                    Consider removing the references first, or use Force Delete only if you understand the consequences.
                  </p>
                </div>
              </div>
            ) : (
              'This action cannot be undone. This will permanently delete the document from your system.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {error ? (
            hasReferences && onForceDelete ? (
              <AlertDialogAction 
                onClick={onForceDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                Force Delete
              </AlertDialogAction>
            ) : null
          ) : hasReferences && onForceDelete ? (
            <AlertDialogAction 
              onClick={onForceDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Force Delete'}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation;
