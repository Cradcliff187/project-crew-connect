
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EstimateDocument {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
  category?: string;
  version?: number;
  storage_path: string;
}

export interface UseEstimateDocumentsProps {
  estimateId: string;
}

export const useEstimateDocuments = ({ estimateId }: UseEstimateDocumentsProps) => {
  const [documents, setDocuments] = useState<EstimateDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all documents related to an estimate
   */
  const fetchDocuments = async () => {
    if (!estimateId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Generate signed URLs for each document
      const docsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          try {
            const { data: urlData } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 3600);
              
            return {
              ...doc,
              url: urlData?.signedUrl || ''
            } as EstimateDocument;
          } catch (err) {
            console.error('Error generating URL for document:', err);
            return {
              ...doc,
              url: ''
            } as EstimateDocument;
          }
        })
      );
      
      setDocuments(docsWithUrls);
    } catch (error) {
      console.error('Error fetching estimate documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a document by ID
   */
  const deleteDocument = async (documentId: string) => {
    try {
      setIsLoading(true);
      
      // First get the document to find the storage path
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('construction_documents')
          .remove([doc.storage_path]);
          
        if (storageError) throw storageError;
      }
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteError) throw deleteError;
      
      // Update local state
      setDocuments(documents.filter(d => d.document_id !== documentId));
      
      toast({
        title: 'Document Deleted',
        description: 'The document has been deleted',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    fetchDocuments,
    deleteDocument
  };
};

export default useEstimateDocuments;
