import React from 'react';
import { Document } from './schemas/documentSchema';
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
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentDeleteDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentDeleted?: () => void;
}

const DocumentDeleteDialog: React.FC<DocumentDeleteDialogProps> = ({
  document,
  open,
  onOpenChange,
  onDocumentDeleted,
}) => {
  const handleDelete = async () => {
    if (!document?.document_id) return;

    try {
      // Delete from storage
      if (document.storage_path) {
        await supabase.storage.from('construction_documents').remove([document.storage_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', document.document_id);

      if (error) {
        console.error('Error deleting document:', error);
        return;
      }

      // Call the callback
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (err) {
      console.error('Error in delete operation:', err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this document?
            <div className="mt-4 bg-muted p-3 rounded-md">
              <div className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                <span className="font-medium">{document?.file_name}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. The document will be permanently deleted.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DocumentDeleteDialog;
