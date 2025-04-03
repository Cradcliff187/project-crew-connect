
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, EntityType } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';
import { deleteDocument } from '@/utils/documentManager';

export default function useDocumentManager(entityType: EntityType, entityId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  
  // Fetch documents for the specified entity
  const fetchDocuments = useCallback(async () => {
    if (!entityId || !entityType) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching documents for ${entityType} with ID ${entityId}`);
      // Fetch documents from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get the storage URLs for each document
      const docsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return {
            ...doc,
            url: urlData.publicUrl,
          } as Document;
        })
      );
      
      setDocuments(docsWithUrls);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error fetching documents',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Handle viewing a document
  const handleViewDocument = useCallback((document: Document) => {
    setCurrentDocument(document);
    setIsDetailViewOpen(true);
  }, []);
  
  // Handle closing the detail view
  const handleCloseDetailView = useCallback(() => {
    setIsDetailViewOpen(false);
    // Small delay to avoid visual glitch during closing animation
    setTimeout(() => {
      setCurrentDocument(null);
    }, 300);
  }, []);
  
  // Handle document deletion
  const handleDeleteDocument = useCallback(async (document: Document) => {
    if (!document.document_id) return;
    
    try {
      const result = await deleteDocument(document.document_id);
      
      if (result.success) {
        toast({
          title: 'Document deleted',
          description: 'Document was successfully deleted',
        });
        
        // Update the documents list
        setDocuments(prev => prev.filter(doc => doc.document_id !== document.document_id));
        
        // Close the detail view if it's open
        if (isDetailViewOpen && currentDocument?.document_id === document.document_id) {
          handleCloseDetailView();
        }
      } else {
        toast({
          title: 'Error deleting document',
          description: result.message || 'Failed to delete document',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error deleting document',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [currentDocument, isDetailViewOpen, handleCloseDetailView]);
  
  // Handle document upload success
  const handleDocumentUploaded = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Select a related document to view
  const selectRelatedDocument = useCallback((document: Document) => {
    setCurrentDocument(document);
  }, []);
  
  return {
    documents,
    loading,
    currentDocument,
    isDetailViewOpen,
    handleViewDocument,
    handleCloseDetailView,
    handleDeleteDocument,
    handleDocumentUploaded,
    selectRelatedDocument,
    fetchDocuments,
  };
}
