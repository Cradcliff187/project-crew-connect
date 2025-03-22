
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string | null;
}

const DeleteConfirmation = ({ open, onClose, onConfirm, error }: DeleteConfirmationProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            {!error 
              ? "Are you sure you want to delete this document? This action cannot be undone."
              : "This document cannot be deleted"
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md mt-2 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            {error ? "Close" : "Cancel"}
          </Button>
          {!error && (
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmation;
