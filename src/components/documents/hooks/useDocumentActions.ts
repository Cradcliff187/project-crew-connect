
import { useState, useCallback } from 'react';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';
import { toast } from '@/hooks/use-toast';

export function useDocumentActions(onRefetch?: () => void) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasReferences, setHasReferences] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle document selection for viewing
  const handleDocumentSelect = useCallback((document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  }, []);
  
  // Handle opening the delete confirmation dialog
  const handleDeleteDialogOpen = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDeleteError(null);
    setHasReferences(false);
    setIsDeleteOpen(true);
  }, []);
  
  // Handle document deletion
  const handleDeleteDocument = useCallback(async () => {
    if (!selectedDocument) return;
    
    setIsLoading(true);
    setDeleteError(null);
    
    try {
      const { success, error } = await DocumentService.deleteDocument(selectedDocument.document_id);
      
      if (success) {
        setIsDeleteOpen(false);
        setSelectedDocument(null);
        toast({
          title: 'Document deleted',
          description: 'The document has been successfully deleted',
        });
        
        if (onRefetch) {
          onRefetch();
        }
      } else if (error) {
        if (error.message.includes('referenced')) {
          setHasReferences(true);
          setDeleteError(error.message);
        } else {
          setDeleteError(error.message);
        }
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting the document');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDocument, onRefetch]);
  
  // Handle force delete (ignoring references)
  const handleForceDelete = useCallback(async () => {
    // This would need backend changes to implement properly
    setDeleteError('Force delete is not currently supported');
  }, []);
  
  // Handle upload success
  const handleUploadSuccess = useCallback((documentId?: string) => {
    setIsUploadOpen(false);
    if (documentId) {
      toast({
        title: 'Upload successful',
        description: 'Your document has been uploaded',
      });
      
      if (onRefetch) {
        onRefetch();
      }
    }
  }, [onRefetch]);
  
  return {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    hasReferences,
    isLoading,
    setIsDetailOpen,
    setIsDeleteOpen,
    setIsUploadOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleForceDelete,
    handleUploadSuccess
  };
}
