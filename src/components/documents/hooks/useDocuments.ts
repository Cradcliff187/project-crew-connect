
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, EntityType } from '../schemas/documentSchema';
import { parseEntityType } from '../utils/documentTypeUtils';
import { useToast } from '@/hooks/use-toast';

interface UseDocumentsOptions {
  entityType?: EntityType;
  entityId?: string;
  category?: string;
  tag?: string;
  limit?: number;
  autoFetch?: boolean;
}

/**
 * Hook for fetching and managing documents
 */
export function useDocuments(options: UseDocumentsOptions = {}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  /**
   * Fetch documents based on provided filters
   */
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('documents_with_urls')
        .select('*');

      // Add filters if provided
      if (options.entityType && options.entityId) {
        query = query
          .eq('entity_type', options.entityType)
          .eq('entity_id', options.entityId);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.tag) {
        query = query.contains('tags', [options.tag]);
      }

      // Add sorting and limit
      query = query.order('created_at', { ascending: false });

      if (options.limit && options.limit > 0) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Error fetching documents: ${fetchError.message}`);
      }

      // Convert the data to our Document type
      const typedDocuments: Document[] = (data || []).map(doc => ({
        ...doc,
        entity_type: parseEntityType(doc.entity_type)
      } as Document));

      setDocuments(typedDocuments);
    } catch (err: any) {
      console.error('Error in useDocuments:', err);
      setError(err);
      
      toast({
        title: "Error loading documents",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [
    options.entityType,
    options.entityId,
    options.category,
    options.tag,
    options.limit,
    toast
  ]);

  /**
   * Trigger a refresh of the documents
   */
  const refreshDocuments = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setLoading(true);

      // First, get the document to find its storage path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to find document: ${fetchError.message}`);
      }

      // Delete the file from storage
      if (document?.storage_path) {
        await supabase.storage
          .from('construction_documents')
          .remove([document.storage_path]);
      }

      // Delete document relationships
      await supabase
        .from('document_relationships')
        .delete()
        .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);

      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);

      if (deleteError) {
        throw new Error(`Failed to delete document: ${deleteError.message}`);
      }

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));

      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted"
      });

    } catch (err: any) {
      console.error('Error deleting document:', err);
      
      toast({
        title: "Error deleting document",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Batch delete multiple documents
   */
  const batchDeleteDocuments = useCallback(async (documentIds: string[]) => {
    if (!documentIds.length) return;
    
    try {
      setLoading(true);

      for (const docId of documentIds) {
        // First, get the document to find its storage path
        const { data: document, error: fetchError } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('document_id', docId)
          .single();

        if (fetchError) {
          console.error(`Failed to find document ${docId}: ${fetchError.message}`);
          continue;
        }

        // Delete the file from storage
        if (document?.storage_path) {
          await supabase.storage
            .from('construction_documents')
            .remove([document.storage_path]);
        }

        // Delete document relationships
        await supabase
          .from('document_relationships')
          .delete()
          .or(`source_document_id.eq.${docId},target_document_id.eq.${docId}`);

        // Delete the document record
        await supabase
          .from('documents')
          .delete()
          .eq('document_id', docId);
      }

      // Update local state
      setDocuments(prev => prev.filter(doc => !documentIds.includes(doc.document_id)));

      toast({
        title: "Documents deleted",
        description: `${documentIds.length} document(s) have been successfully deleted`
      });

    } catch (err: any) {
      console.error('Error batch deleting documents:', err);
      
      toast({
        title: "Error deleting documents",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      refreshDocuments();
    }
  }, [toast, refreshDocuments]);

  // Auto-fetch documents when options change or refresh is triggered
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchDocuments();
    }
  }, [fetchDocuments, refreshTrigger, options.autoFetch]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    refreshDocuments,
    deleteDocument,
    batchDeleteDocuments
  };
}
