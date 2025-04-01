
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';

export function useDocumentActions(fetchDocuments: () => void) {
  // State for document operations
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasReferences, setHasReferences] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Select a document to view details
  const handleDocumentSelect = useCallback((document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  }, []);

  // Open delete confirmation dialog
  const handleDeleteDialogOpen = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDeleteError(null);
    setHasReferences(false);
    setIsDeleteOpen(true);
  }, []);

  // Handle document deletion
  const handleDeleteDocument = useCallback(async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      // Check if document has references in other tables
      const { data: references, error: refError } = await supabase.rpc(
        'check_document_references',
        { document_id: selectedDocument.document_id }
      );
      
      if (refError) throw refError;
      
      // If document has references, show warning but don't delete
      if (references && references.has_references) {
        setHasReferences(true);
        setDeleteError('This document is referenced by other records in the system.');
        return;
      }
      
      // Delete the document from the database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', selectedDocument.document_id);
      
      if (deleteError) throw deleteError;
      
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from(DOCUMENTS_BUCKET_ID)
        .remove([selectedDocument.storage_path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        toast({
          title: 'File deleted from database',
          description: 'File was removed from database, but could not be deleted from storage.',
          variant: 'default',
        });
      }
      
      toast({
        title: 'Document deleted',
        description: 'Document has been permanently deleted.',
      });
      
      // Close the dialog and refresh the documents list
      setIsDeleteOpen(false);
      fetchDocuments();
      
    } catch (error: any) {
      console.error('Error deleting document:', error);
      setDeleteError(error.message || 'An error occurred while deleting the document');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedDocument, fetchDocuments]);
  
  // Force delete even with references (danger!)
  const handleForceDelete = useCallback(async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      // Force delete the document
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', selectedDocument.document_id);
      
      if (deleteError) throw deleteError;
      
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from(DOCUMENTS_BUCKET_ID)
        .remove([selectedDocument.storage_path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
      
      toast({
        title: 'Document force deleted',
        description: 'Document has been permanently deleted, but references may still exist.',
        variant: 'destructive',
      });
      
      // Close the dialog and refresh the documents list
      setIsDeleteOpen(false);
      fetchDocuments();
      
    } catch (error: any) {
      console.error('Error force deleting document:', error);
      setDeleteError(error.message || 'An error occurred while deleting the document');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedDocument, fetchDocuments]);

  // Handle successful upload
  const handleUploadSuccess = useCallback((documentId?: string) => {
    setIsUploadOpen(false);
    fetchDocuments();
    toast({
      title: 'Document uploaded',
      description: 'Document has been successfully uploaded.',
    });
  }, [fetchDocuments]);

  return {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    hasReferences,
    isDeleting,
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleForceDelete,
    handleUploadSuccess
  };
}
