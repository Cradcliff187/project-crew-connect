import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useToast } from '@/hooks/use-toast';

export const useDocumentActions = (fetchDocuments: () => void) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasReferences, setHasReferences] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const { toast } = useToast();

  // Function to handle refreshing documents after successful operations
  const onSuccessfulDelete = () => {
    fetchDocuments();
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  };

  const handleDeleteDialogOpen = async (document: Document) => {
    setSelectedDocument(document);
    setDeleteError(null);
    setHasReferences(false);

    try {
      const { count: expensesCount, error: expensesCheckError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', document.document_id);

      if (expensesCheckError) {
        console.error('Error checking expenses references:', expensesCheckError);
        throw expensesCheckError;
      }

      const { count: timeEntriesCount, error: timeEntriesCheckError } = await supabase
        .from('time_entry_document_links')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', document.document_id);

      if (timeEntriesCheckError) {
        console.error('Error checking time entries references:', timeEntriesCheckError);
        throw timeEntriesCheckError;
      }

      if ((expensesCount && expensesCount > 0) || (timeEntriesCount && timeEntriesCount > 0)) {
        setHasReferences(true);
      }

      setIsDeleteOpen(true);
    } catch (error) {
      console.error('Error checking document references:', error);
      toast({
        title: 'Error',
        description: 'Could not check document references',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      setDeleteError(null);

      const { count: expensesCount, error: expensesCheckError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', selectedDocument.document_id);

      if (expensesCheckError) throw expensesCheckError;

      const { count: timeEntriesCount, error: timeEntriesCheckError } = await supabase
        .from('time_entry_document_links')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', selectedDocument.document_id);

      if (timeEntriesCheckError) throw timeEntriesCheckError;

      if ((expensesCount && expensesCount > 0) || (timeEntriesCount && timeEntriesCount > 0)) {
        setHasReferences(true);
        setDeleteError(
          'This document is being used as a receipt and cannot be deleted. ' +
            "Use 'Force Delete' to remove the references and delete the document."
        );

        return;
      }

      await deleteDocumentFromStorage();

      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted.',
      });

      onSuccessfulDelete();
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      console.error('Error deleting document:', error);

      let errorMessage = 'Failed to delete document';

      if (error.code === '23503') {
        errorMessage =
          'This document is referenced by another record and cannot be deleted. You need to remove those references first.';
      } else {
        errorMessage = error.message || 'An unknown error occurred';
      }

      setDeleteError(errorMessage);

      toast({
        title: 'Failed to delete document',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleForceDelete = async () => {
    if (!selectedDocument) return;

    try {
      setDeleteError(null);

      const { error: expensesUpdateError } = await supabase
        .from('expenses')
        .update({ document_id: null })
        .eq('document_id', selectedDocument.document_id);

      if (expensesUpdateError) throw expensesUpdateError;

      const { error: timeEntryLinksError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('document_id', selectedDocument.document_id);

      if (timeEntryLinksError) throw timeEntryLinksError;

      await deleteDocumentFromStorage();

      toast({
        title: 'Document force deleted',
        description: 'The document and all references to it have been deleted.',
      });

      onSuccessfulDelete();
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      console.error('Error force deleting document:', error);
      setDeleteError(error.message || 'An unknown error occurred');

      toast({
        title: 'Failed to delete document',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleBatchDelete = async (documentIds: string[]) => {
    if (!documentIds.length) return;

    try {
      setBatchDeleteLoading(true);

      for (const documentId of documentIds) {
        const { error } = await supabase.from('documents').delete().eq('document_id', documentId);

        if (error) {
          throw error;
        }
      }

      fetchDocuments();

      toast({
        title: 'Documents deleted',
        description: `Successfully deleted ${documentIds.length} document(s)`,
      });
    } catch (error: any) {
      console.error('Error deleting documents:', error);
      setDeleteError(error.message);

      toast({
        title: 'Delete failed',
        description: error.message || 'There was an error deleting the documents',
        variant: 'destructive',
      });
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const deleteDocumentFromStorage = async () => {
    if (!selectedDocument) return;

    if (selectedDocument.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([selectedDocument.storage_path]);

      if (storageError) throw storageError;
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', selectedDocument.document_id);

    if (dbError) throw dbError;
  };

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    onSuccessfulDelete();
    toast({
      title: 'Document uploaded',
      description: 'Your document has been successfully uploaded.',
    });
  };

  return {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    hasReferences,
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleForceDelete,
    handleUploadSuccess,
    batchDeleteLoading,
    handleBatchDelete,
  };
};
