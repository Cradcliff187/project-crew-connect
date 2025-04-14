import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { filterDocumentsByType, categorizeDocuments } from '../components/document-upload/utils';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const form = useFormContext<EstimateFormValues>();
  // Use debounce to prevent too many renders when document IDs change
  const documentIds = useDebounce(form.watch('estimate_documents') || [], 300);
  // Get tempId only once to avoid re-renders
  const tempId = form.getValues('temp_id');

  // Memoized fetch function
  const fetchDocuments = useCallback(async () => {
    if (documentIds.length === 0) {
      setAttachedDocuments([]);
      setLoading(false);
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
      } else {
        setAttachedDocuments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [documentIds]);

  // Fetch documents when documentIds change or fetch is triggered
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, fetchTrigger]);

  // Handle document upload success
  const handleDocumentUploadSuccess = useCallback(
    (documentId?: string) => {
      setIsDocumentUploadOpen(false);
      if (documentId) {
        const updatedDocumentIds = [...documentIds, documentId];
        form.setValue('estimate_documents', updatedDocumentIds, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false,
        });

        toast({
          title: 'Document attached',
          description: 'Document has been attached to the estimate',
        });

        // Trigger a re-fetch after updating document IDs
        setFetchTrigger(prev => prev + 1);
      }
    },
    [documentIds, form]
  );

  // Handle document removal
  const handleRemoveDocument = useCallback(
    (documentId: string) => {
      const updatedDocumentIds = documentIds.filter(id => id !== documentId);
      form.setValue('estimate_documents', updatedDocumentIds, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });

      toast({
        title: 'Document removed',
        description: 'Document has been removed from the estimate',
      });

      // Trigger a re-fetch after updating document IDs
      setFetchTrigger(prev => prev + 1);
    },
    [documentIds, form]
  );

  // Handle document viewing
  const handleViewDocument = useCallback((document: Document) => {
    setViewDocument(document);
  }, []);

  // Close document viewer
  const closeViewer = useCallback(() => {
    setViewDocument(null);
  }, []);

  // Handle opening document upload
  const handleOpenDocumentUpload = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  // Process documents for the UI - memoized to prevent unnecessary re-processing
  // These are computed values that don't need reactive updates, so we can calculate them once
  const filteredDocuments = filterDocumentsByType(attachedDocuments, showLineItemDocuments);
  const documentsByCategory = categorizeDocuments(filteredDocuments);

  // Determine title based on document type
  const title = showLineItemDocuments ? 'Line Item Documents' : 'Estimate Documents';

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
    entityType: showLineItemDocuments ? ('ESTIMATE_ITEM' as const) : ('ESTIMATE' as const),
    itemId: showLineItemDocuments ? estimateItemId : undefined,
  };
}
