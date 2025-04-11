
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, EntityType, documentService } from '@/services/documentService';
import { toast } from '@/hooks/use-toast';

interface DocumentRelationship {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type: string;
  relationship_metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useDocumentRelationships = (documentId: string) => {
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch document relationships
  useEffect(() => {
    if (!documentId) return;
    
    const fetchRelationships = async () => {
      setLoading(true);
      try {
        // Fetch relationships where this document is either source or target
        const { data, error } = await supabase
          .from('document_relationships')
          .select('*')
          .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);
        
        if (error) throw error;
        
        setRelationships(data || []);
        
        // Fetch related document details
        if (data && data.length > 0) {
          const relatedDocIds = data.map(rel => 
            rel.source_document_id === documentId ? 
              rel.target_document_id : rel.source_document_id
          ).filter(id => id !== null);
          
          const relatedDocs: Document[] = [];
          
          for (const id of relatedDocIds) {
            const result = await documentService.getDocumentById(id);
            if (result.success && result.document) {
              relatedDocs.push(result.document);
            }
          }
          
          setRelatedDocuments(relatedDocs);
        }
        
      } catch (err: any) {
        console.error('Error fetching document relationships:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelationships();
  }, [documentId]);
  
  // Create a relationship between documents
  const createRelationship = async (
    targetDocumentId: string,
    relationshipType: string,
    metadata?: any
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('document_relationships')
        .insert({
          source_document_id: documentId,
          target_document_id: targetDocumentId,
          relationship_type: relationshipType,
          relationship_metadata: metadata
        });
      
      if (error) throw error;
      
      // Refresh relationships
      const { data } = await supabase
        .from('document_relationships')
        .select('*')
        .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);
      
      setRelationships(data || []);
      
      // Fetch the newly related document
      const result = await documentService.getDocumentById(targetDocumentId);
      if (result.success && result.document) {
        setRelatedDocuments([...relatedDocuments, result.document]);
      }
      
      toast({
        title: 'Success',
        description: 'Document relationship created successfully',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error creating document relationship:', err);
      toast({
        title: 'Error',
        description: `Failed to create relationship: ${err.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Remove a relationship
  const deleteRelationship = async (relationshipId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('document_relationships')
        .delete()
        .eq('id', relationshipId);
      
      if (error) throw error;
      
      // Update local state
      setRelationships(relationships.filter(rel => rel.id !== relationshipId));
      
      toast({
        title: 'Success',
        description: 'Document relationship removed successfully',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting document relationship:', err);
      toast({
        title: 'Error',
        description: `Failed to remove relationship: ${err.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return {
    relationships,
    relatedDocuments,
    loading,
    error,
    createRelationship,
    deleteRelationship
  };
};
