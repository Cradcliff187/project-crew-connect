
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';
import { DocumentRelationship } from '@/hooks/useDocumentRelationships';

interface RelationshipOperations {
  relatedDocuments: Document[];
  loading: boolean;
  error: Error | null;
  fetchRelationships: () => Promise<void>;
  createRelationship: (targetDocumentId: string, relationshipType: string) => Promise<{
    success: boolean;
    error?: Error;
  }>;
  removeRelationship: (relationshipId: string) => Promise<{
    success: boolean;
    error?: Error;
  }>;
}

export const useDocumentRelationshipsOps = (documentId?: string): RelationshipOperations => {
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Reuse the existing fetchRelationships logic but connect to the main hook
  const fetchRelationships = async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the same supabase queries as the main hook but simplify the response
      const { data: sourceRelationships, error: sourceError } = await supabase
        .from('document_relationships')
        .select(`
          id, 
          relationship_type, 
          target_document_id
        `)
        .eq('source_document_id', documentId);
        
      if (sourceError) throw sourceError;
      
      const { data: targetRelationships, error: targetError } = await supabase
        .from('document_relationships')
        .select(`
          id, 
          relationship_type, 
          source_document_id
        `)
        .eq('target_document_id', documentId);
        
      if (targetError) throw targetError;
      
      // Get unique document IDs from relationships
      const relatedDocIds = [
        ...sourceRelationships.map(rel => rel.target_document_id),
        ...targetRelationships.map(rel => rel.source_document_id)
      ];
      
      if (relatedDocIds.length === 0) {
        setRelatedDocuments([]);
        return;
      }
      
      // Fetch related documents
      const { data: documents, error: docError } = await supabase
        .from('documents_with_urls')
        .select('*')
        .in('document_id', relatedDocIds);
        
      if (docError) throw docError;
      
      // Map documents with relationship info
      const docsWithRelationships = documents.map(doc => {
        // Find if this document is related as source or target
        const asSource = sourceRelationships.find(rel => rel.target_document_id === doc.document_id);
        const asTarget = targetRelationships.find(rel => rel.source_document_id === doc.document_id);
        
        // Get relationship info
        const relationship = asSource || asTarget;
        
        return {
          ...doc,
          relationship_id: relationship?.id,
          relationship_type: relationship?.relationship_type
        } as Document;
      });
      
      setRelatedDocuments(docsWithRelationships);
    } catch (err: any) {
      console.error('Error fetching document relationships:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const createRelationship = async (targetDocumentId: string, relationshipType: string) => {
    if (!documentId) return { success: false, error: new Error('No source document ID provided') };
    
    try {
      const relationshipData = {
        source_document_id: documentId,
        target_document_id: targetDocumentId,
        relationship_type: relationshipType,
      };
      
      const { error } = await supabase
        .from('document_relationships')
        .insert(relationshipData);
        
      if (error) throw error;
      
      toast({
        title: "Relationship created",
        description: "Documents have been linked successfully"
      });
      
      // Refresh relationships
      await fetchRelationships();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error creating relationship:', err);
      
      toast({
        title: "Failed to create relationship",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
      
      return { success: false, error: err };
    }
  };
  
  const removeRelationship = async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('document_relationships')
        .delete()
        .eq('id', relationshipId);
        
      if (error) throw error;
      
      toast({
        title: "Relationship removed",
        description: "Document relationship has been removed"
      });
      
      // Refresh relationships
      await fetchRelationships();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error removing relationship:', err);
      
      toast({
        title: "Failed to remove relationship",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
      
      return { success: false, error: err };
    }
  };
  
  useEffect(() => {
    fetchRelationships();
  }, [documentId]);
  
  return {
    relatedDocuments,
    loading,
    error,
    fetchRelationships,
    createRelationship,
    removeRelationship
  };
};

// Compatibility layer to support existing code
export default useDocumentRelationshipsOps;
