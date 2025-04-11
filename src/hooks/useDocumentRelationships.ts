
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Document, RelationshipType, DocumentRelationship, CreateRelationshipParams } from '@/components/documents/schemas/documentSchema';
import { parseEntityType } from '@/components/documents/utils/documentTypeUtils';

export { RelationshipType, DocumentRelationship, CreateRelationshipParams };

interface RelatedDocumentResponse {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  updated_at: string;
  category: string;
  tags: string[];
  relationship_type: RelationshipType;
}

export function useDocumentRelationships(documentId: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch document relationships
  const {
    data: relationships,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['documentRelationships', documentId],
    queryFn: async () => {
      try {
        setError(null);
        
        // Get all relationships where this document is the source
        const { data: sourceRelations, error: sourceError } = await supabase
          .from('document_relationships')
          .select(`
            id,
            source_document_id,
            target_document_id,
            relationship_type,
            created_at,
            target_documents:documents(*)
          `)
          .eq('source_document_id', documentId);
          
        if (sourceError) throw sourceError;
        
        // Format relationships
        const formattedSourceRelations = sourceRelations.map(relation => {
          // Handle possible null values safely
          const targetDoc = relation.target_documents ? {
            ...relation.target_documents,
            entity_type: parseEntityType(relation.target_documents.entity_type)
          } : null;
          
          return {
            id: relation.id,
            source_document_id: relation.source_document_id,
            target_document_id: relation.target_document_id,
            relationship_type: relation.relationship_type,
            created_at: relation.created_at,
            target_document: targetDoc
          };
        });
        
        // Get all relationships where this document is the target
        const { data: targetRelations, error: targetError } = await supabase
          .from('document_relationships')
          .select(`
            id,
            source_document_id,
            target_document_id,
            relationship_type,
            created_at,
            source_documents:documents(*)
          `)
          .eq('target_document_id', documentId);
          
        if (targetError) throw targetError;
        
        // Format relationships
        const formattedTargetRelations = targetRelations.map(relation => {
          // Handle possible null values safely
          const sourceDoc = relation.source_documents ? {
            ...relation.source_documents,
            entity_type: parseEntityType(relation.source_documents.entity_type)
          } : null;
          
          return {
            id: relation.id,
            source_document_id: relation.source_document_id,
            target_document_id: relation.target_document_id,
            relationship_type: relation.relationship_type,
            created_at: relation.created_at,
            source_document: sourceDoc,
            inverted: true // Flag to indicate this is a reverse relationship
          };
        });
        
        return [...formattedSourceRelations, ...formattedTargetRelations];
      } catch (err: any) {
        setError(err?.message || 'Failed to load relationships');
        return [];
      }
    },
    enabled: !!documentId
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: async (params: CreateRelationshipParams) => {
      try {
        const { sourceDocumentId, targetDocumentId, relationshipType } = params;
        
        // Don't create relationship with self
        if (sourceDocumentId === targetDocumentId) {
          throw new Error('Cannot create relationship with the same document');
        }
        
        const { data, error } = await supabase
          .from('document_relationships')
          .insert({
            source_document_id: sourceDocumentId,
            target_document_id: targetDocumentId,
            relationship_type: relationshipType,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        return data;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to create relationship');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Relationship created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['documentRelationships', documentId] });
      refetch();
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create relationship',
        variant: 'destructive',
      });
    }
  });

  // Delete relationship mutation
  const deleteRelationshipMutation = useMutation({
    mutationFn: async (relationshipId: string) => {
      try {
        const { error } = await supabase
          .from('document_relationships')
          .delete()
          .eq('id', relationshipId);
          
        if (error) throw error;
        return relationshipId;
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to delete relationship');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Relationship removed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['documentRelationships', documentId] });
      refetch();
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete relationship',
        variant: 'destructive',
      });
    }
  });

  // Create relationship handler
  const createRelationship = useCallback((params: CreateRelationshipParams) => {
    createRelationshipMutation.mutate(params);
  }, [createRelationshipMutation]);

  // Delete relationship handler
  const deleteRelationship = useCallback((relationshipId: string) => {
    deleteRelationshipMutation.mutate(relationshipId);
  }, [deleteRelationshipMutation]);

  return {
    relationships: relationships || [],
    loading,
    error,
    createRelationship,
    deleteRelationship,
    isCreating: createRelationshipMutation.isPending,
    isDeleting: deleteRelationshipMutation.isPending,
    refetch
  };
}

export default useDocumentRelationships;
