import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';

export function useDocumentVersions(documentId?: string) {
  const [documentVersions, setDocumentVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all versions of a document
  const fetchVersions = useCallback(async () => {
    if (!documentId) {
      setDocumentVersions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get the current document to check if it has a parent_document_id
      const { data: currentDoc, error: currentDocError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (currentDocError) {
        throw currentDocError;
      }

      // If this document has a parent_document_id, use that to find all versions
      // Otherwise, this document is the parent
      const parentId = currentDoc.parent_document_id || documentId;

      // Get all documents that have this parent_document_id
      // and also include the parent document itself
      const { data: versions, error: versionsError } = await supabase
        .from('documents')
        .select('*')
        .or(`parent_document_id.eq.${parentId},document_id.eq.${parentId}`);

      if (versionsError) {
        throw versionsError;
      }

      // Get URLs for all documents
      const docsWithUrls = await Promise.all(
        versions.map(async (doc) => {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);

          return {
            ...doc,
            url: urlData.publicUrl
          };
        })
      );

      setDocumentVersions(docsWithUrls);
    } catch (err: any) {
      console.error('Error fetching document versions:', err);
      setError(err.message || 'Failed to load document versions');
      setDocumentVersions([]);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Create a new version of the document
  const createNewVersion = async (file: File, notes?: string): Promise<boolean> => {
    if (!documentId) return false;
    
    try {
      const result = await DocumentService.createNewVersion(documentId, file, notes);
      
      if (result) {
        // Refresh the versions list
        fetchVersions();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error creating new version:', err);
      return false;
    }
  };

  // Fetch versions when documentId changes
  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    documentVersions,
    loading,
    error,
    createNewVersion,
    refetchVersions: fetchVersions
  };
}
