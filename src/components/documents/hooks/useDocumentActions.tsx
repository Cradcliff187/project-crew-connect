
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useToast } from '@/hooks/use-toast';

export const useDocumentActions = (onSuccessfulDelete: () => void) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  };

  const handleDeleteDialogOpen = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([selectedDocument.storage_path]);
        
      if (storageError) throw storageError;
      
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
      toast({
        title: "Failed to delete document",
        description: error.message,
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
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleUploadSuccess
  };
};
