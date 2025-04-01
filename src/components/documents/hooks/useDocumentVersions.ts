
import { useState, useEffect } from 'react';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';
import { fetchDocumentVersions } from '../services/DocumentFetcher';

interface UseDocumentVersionsResult {
  documentVersions: Document[];
  loading: boolean;
  error: string | null;
  createNewVersion: (file: File, notes?: string) => Promise<boolean>;
  refetchVersions: () => Promise<void>;
}

export function useDocumentVersions(documentId?: string): UseDocumentVersionsResult {
  const [documentVersions, setDocumentVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    if (!documentId) {
      setDocumentVersions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const versions = await fetchDocumentVersions(documentId);
      setDocumentVersions(versions);
    } catch (err: any) {
      console.error('Error fetching document versions:', err);
      setError(err.message || 'Failed to fetch document versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const createNewVersion = async (file: File, notes?: string): Promise<boolean> => {
    if (!documentId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const newVersion = await DocumentService.createDocumentVersion(documentId, file, notes);
      
      if (!newVersion) {
        throw new Error('Failed to create new document version');
      }
      
      // Update the versions list
      await fetchVersions();
      
      return true;
    } catch (err: any) {
      console.error('Error creating document version:', err);
      setError(err.message || 'Failed to create document version');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    documentVersions,
    loading,
    error,
    createNewVersion,
    refetchVersions: fetchVersions
  };
}
