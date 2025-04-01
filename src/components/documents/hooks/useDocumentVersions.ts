
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { DocumentService } from '../services/DocumentService';

export const useDocumentVersions = (documentId?: string) => {
  const [documentVersions, setDocumentVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchVersions = async () => {
    if (!documentId) {
      setDocumentVersions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      // First, get the current document
      const { data: currentDoc, error: currentDocError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (currentDocError) {
        throw currentDocError;
      }
      
      let allVersions: Document[] = [];
      
      // If this document has a parent, fetch all siblings (including parent)
      if (currentDoc.parent_document_id) {
        const parentId = currentDoc.parent_document_id;
        
        // Get the parent
        const { data: parentDoc, error: parentError } = await supabase
          .from('documents')
          .select('*')
          .eq('document_id', parentId)
          .single();
        
        if (parentError) {
          throw parentError;
        }
        
        // Get all children of the parent (siblings of current doc)
        const { data: siblings, error: siblingsError } = await supabase
          .from('documents')
          .select('*')
          .eq('parent_document_id', parentId);
        
        if (siblingsError) {
          throw siblingsError;
        }
        
        allVersions = [parentDoc, ...siblings];
      } else {
        // This is a parent document, get all its children
        const { data: children, error: childrenError } = await supabase
          .from('documents')
          .select('*')
          .eq('parent_document_id', documentId);
        
        if (childrenError) {
          throw childrenError;
        }
        
        allVersions = [currentDoc, ...(children || [])];
      }
      
      // Add URLs to all documents
      const versionsWithUrls = await Promise.all(allVersions.map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return { ...doc, url: publicUrl };
      }));
      
      // Sort by version
      const sortedVersions = versionsWithUrls.sort((a, b) => 
        (b.version || 1) - (a.version || 1)
      );
      
      setDocumentVersions(sortedVersions);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      setDocumentVersions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new version of the document
  const createNewVersion = async (file: File, notes?: string): Promise<boolean> => {
    if (!documentId) return false;
    
    try {
      const result = await DocumentService.createNewVersion(documentId, file, notes);
      
      if (result) {
        await fetchVersions();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating new version:', error);
      return false;
    }
  };
  
  // Fetch versions when documentId changes
  useEffect(() => {
    fetchVersions();
  }, [documentId]);
  
  return {
    documentVersions,
    loading,
    createNewVersion,
    refetchVersions: fetchVersions
  };
};
