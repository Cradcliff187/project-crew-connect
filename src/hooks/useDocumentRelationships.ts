
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Document, DocumentRelationship, CreateRelationshipParams, RelationshipType } from '@/components/documents/schemas/documentSchema';

export { RelationshipType, DocumentRelationship, CreateRelationshipParams };

export const useDocumentRelationships = (documentId: string) => {
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRelationships = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      // Fetch relationships where the document is either source or target
      const { data: sourceRelations, error: sourceError } = await supabase
        .from('document_relationships')
        .select(`
          id, 
          relationship_type, 
          relationship_metadata,
          source_document_id,
          target_document_id,
          created_at,
          target_document:documents!document_relationships_target_document_id_fkey(*),
          source_document:documents!document_relationships_source_document_id_fkey(*)
        `)
        .eq('source_document_id', documentId);

      if (sourceError) throw sourceError;

      const { data: targetRelations, error: targetError } = await supabase
        .from('document_relationships')
        .select(`
          id, 
          relationship_type, 
          relationship_metadata,
          source_document_id,
          target_document_id,
          created_at,
          target_document:documents!document_relationships_target_document_id_fkey(*),
          source_document:documents!document_relationships_source_document_id_fkey(*)
        `)
        .eq('target_document_id', documentId);

      if (targetError) throw targetError;

      // Process and combine relationships
      const combinedRelationships = [...sourceRelations, ...targetRelations].map(rel => {
        // Transform database response to match our interface
        const processedRel: DocumentRelationship = {
          id: rel.id,
          relationship_type: rel.relationship_type as RelationshipType,
          source_document_id: rel.source_document_id,
          target_document_id: rel.target_document_id,
          relationship_metadata: rel.relationship_metadata,
          created_at: rel.created_at,
          // Convert entity_type to EntityType enum
          source_document: rel.source_document ? {
            ...rel.source_document,
            entity_type: rel.source_document.entity_type
          } as Document : undefined,
          target_document: rel.target_document ? {
            ...rel.target_document,
            entity_type: rel.target_document.entity_type
          } as Document : undefined
        };
        
        return processedRel;
      });
      
      setRelationships(combinedRelationships);
    } catch (error: any) {
      console.error('Error fetching document relationships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document relationships',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const createRelationship = useCallback(async (params: CreateRelationshipParams) => {
    try {
      const { sourceDocumentId, targetDocumentId, relationshipType, metadata } = params;
      
      // Insert the relationship into the database
      const { data, error } = await supabase
        .from('document_relationships')
        .insert({
          source_document_id: sourceDocumentId,
          target_document_id: targetDocumentId,
          relationship_type: relationshipType,
          relationship_metadata: metadata || {},
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint error
          throw new Error('A relationship already exists between these documents');
        }
        throw error;
      }
      
      // Refresh relationships list
      fetchRelationships();
      
      return data;
    } catch (error: any) {
      console.error('Error creating relationship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create document relationship',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchRelationships]);

  const deleteRelationship = useCallback(async (relationshipId: string) => {
    try {
      // Delete the relationship from the database
      const { error } = await supabase
        .from('document_relationships')
        .delete()
        .eq('id', relationshipId);
      
      if (error) throw error;
      
      // Update state by filtering out the deleted relationship
      setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
      
      toast({
        title: 'Success',
        description: 'Document relationship removed',
      });
    } catch (error: any) {
      console.error('Error deleting relationship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete relationship',
        variant: 'destructive',
      });
    }
  }, []);

  return {
    relationships,
    loading,
    fetchRelationships,
    createRelationship,
    deleteRelationship,
    isCurrentDocument: (id: string) => id === documentId,
  };
};

export default useDocumentRelationships;
