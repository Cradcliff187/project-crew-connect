
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { filterDocumentsByType, categorizeDocuments } from '../components/document-upload/utils';

interface UseEstimateDocumentManagerOptions {
  /**
   * If provided, documents will be filtered to those belonging to this item
   */
  estimateItemId?: string;
  
  /**
   * Whether to show line item documents or main estimate documents
   */
  showLineItemDocuments?: boolean;
}

export function useEstimateDocumentManager(options: UseEstimateDocumentManagerOptions = {}) {
  const { estimateItemId, showLineItemDocuments = false } = options;
  
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useFormContext<EstimateFormValues>();
  const documentIds = form.watch('estimate_documents') || [];
  const tempId = form.watch('temp_id');

  // Fetch documents when document IDs change
  useEffect(() => {
    const fetchDocuments = async () => {
      if (documentIds.length === 0) {
        setAttachedDocuments([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .in('document_id', documentIds);

        if (error) {
          console.error('Error fetching documents:', error);
          toast({
            title: 'Error',
            description: 'Failed to load attached documents',
            variant: 'destructive',
          });
          return;
        }

        setAttachedDocuments(data || []);
      } catch (err) {
        console.error('Error in document fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [documentIds]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    if (documentId) {
      const updatedDocumentIds = [...documentIds, documentId];
      form.setValue('estimate_documents', updatedDocumentIds);
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    const updatedDocumentIds = documentIds.filter(id => id !== documentId);
    form.setValue('estimate_documents', updatedDocumentIds);
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
  };

  const handleViewDocument = (document: Document) => {
    setViewDocument(document);
  };

  const closeViewer = () => {
    setViewDocument(null);
  };

  const handleOpenDocumentUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  };
  
  // Process documents for the UI
  const filteredDocuments = filterDocumentsByType(attachedDocuments, showLineItemDocuments);
  const documentsByCategory = categorizeDocuments(filteredDocuments);
  
  // Determine title based on document type
  const title = showLineItemDocuments ? "Line Item Documents" : "Estimate Documents";

  return {
    // State
    isDocumentUploadOpen,
    setIsDocumentUploadOpen,
    viewDocument,
    loading,
    tempId,
    
    // Processed data
    filteredDocuments,
    documentsByCategory,
    title,
    
    // Event handlers
    handleDocumentUploadSuccess,
    handleRemoveDocument,
    handleViewDocument,
    closeViewer,
    handleOpenDocumentUpload,

    // For the document upload sheet
    entityType: showLineItemDocuments ? "ESTIMATE_ITEM" as const : "ESTIMATE" as const,
    itemId: showLineItemDocuments ? estimateItemId : undefined,
  };
}
