
import { useState, useEffect } from 'react';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';

interface UseDocumentVersionsResult {
  documentVersions: Document[];
  loading: boolean;
  error: string | null;
  createNewVersion: (file: File, notes?: string) => Promise<boolean>;
}

export function useDocumentVersions(documentId?: string): UseDocumentVersionsResult {
  const [documentVersions, setDocumentVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setDocumentVersions([]);
      return;
    }

    async function fetchVersions() {
      try {
        setLoading(true);
        setError(null);

        // Get the current document
        const document = await DocumentService.getDocumentById(documentId);
        if (!document) {
          throw new Error(`Document with ID ${documentId} not found`);
        }

        // Logic to build a versions list
        let versionsToFetch: string[] = [];
        
        // Add the current document
        let versions: Document[] = [document];
        
        // If this document has a parent, we need to fetch the parent and any siblings
        if (document.parent_document_id) {
          versionsToFetch.push(document.parent_document_id);
          
          // Fetch all versions with the same parent
          const { data: siblings } = await DocumentService.getDocumentsWithParent(document.parent_document_id);
          if (siblings && siblings.length > 0) {
            versions = [...versions, ...siblings.filter(d => d.document_id !== documentId)];
          }
        }
        
        // If this document is a parent, fetch its children
        const { data: children } = await DocumentService.getDocumentsWithParent(documentId);
        if (children && children.length > 0) {
          versions = [...versions, ...children];
        }
        
        // Fetch any missing parent document
        if (versionsToFetch.length > 0) {
          const parentDocs = await Promise.all(
            versionsToFetch.map(id => DocumentService.getDocumentById(id))
          );
          
          versions = [...versions, ...parentDocs.filter(Boolean) as Document[]];
        }
        
        // Sort versions by version number
        versions.sort((a, b) => (b.version || 1) - (a.version || 1));
        
        setDocumentVersions(versions);
      } catch (err: any) {
        console.error('Error fetching document versions:', err);
        setError(err.message || 'Failed to fetch document versions');
      } finally {
        setLoading(false);
      }
    }

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
      setDocumentVersions(prev => [newVersion, ...prev].sort((a, b) => (b.version || 1) - (a.version || 1)));
      
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
    createNewVersion
  };
}
