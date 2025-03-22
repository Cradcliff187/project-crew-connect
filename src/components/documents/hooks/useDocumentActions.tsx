
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useToast } from '@/hooks/use-toast';

export const useDocumentActions = (onSuccessfulDelete: () => void) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  };

  const handleDeleteDialogOpen = (document: Document) => {
    setSelectedDocument(document);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      setDeleteError(null);
      
      // Check if document is referenced by work_order_materials
      const { count: materialsCount, error: materialsCheckError } = await supabase
        .from('work_order_materials')
        .select('*', { count: 'exact', head: true })
        .eq('receipt_document_id', selectedDocument.document_id);
        
      if (materialsCheckError) throw materialsCheckError;
      
      if (materialsCount && materialsCount > 0) {
        setDeleteError(
          "This document is being used as a receipt for materials in a work order and cannot be deleted. " +
          "You must first remove the document reference from the work order materials."
        );
        
        toast({
          title: "Cannot delete document",
          description: "This document is linked to work order materials and cannot be deleted.",
          variant: "destructive"
        });
        
        return;
      }
      
      // If we reach here, document is not referenced and can be deleted
      
      // Delete from storage first
      if (selectedDocument.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('construction_documents')
          .remove([selectedDocument.storage_path]);
          
        if (storageError) throw storageError;
      }
      
      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', selectedDocument.document_id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted."
      });
      
      onSuccessfulDelete();
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedDocument(null);
      
    } catch (error: any) {
      console.error('Error deleting document:', error);
      
      let errorMessage = "Failed to delete document";
      
      // Look for foreign key constraint violations
      if (error.code === '23503') {
        errorMessage = "This document is referenced by another record and cannot be deleted. You need to remove those references first.";
      } else {
        errorMessage = error.message || "An unknown error occurred";
      }
      
      setDeleteError(errorMessage);
      
      toast({
        title: "Failed to delete document",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    onSuccessfulDelete(); // Reuse the same function to refresh documents
    toast({
      title: "Document uploaded",
      description: "Your document has been successfully uploaded."
    });
  };

  return {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleUploadSuccess
  };
};
