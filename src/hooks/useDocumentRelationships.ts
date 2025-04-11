
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';

export type RelationshipType = 'REFERENCE' | 'VERSION' | 'ATTACHMENT' | 'RELATED' | 'SUPPLEMENT';

export interface DocumentRelationship {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type: RelationshipType;
  relationship_metadata?: {
    description?: string;
    created_by?: string;
  };
  created_at: string;
  updated_at: string;
  source_document?: Document;
  target_document?: Document;
}

export interface CreateRelationshipParams {
  sourceDocumentId: string;
  targetDocumentId: string;
  relationshipType: RelationshipType;
  relationship_metadata?: {
    description?: string;
    created_by?: string;
  };
}

export const useDocumentRelationships = (documentId?: string) => {
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch relationships where this document is the source
      const { data: sourceRelationships, error: sourceError } = await supabase
        .from('document_relationships')
        .select(`
          id,
          source_document_id,
          target_document_id,
          relationship_type,
          relationship_metadata,
          created_at,
          updated_at,
          target_document:documents!target_document_id(
            document_id, 
            file_name, 
            file_type, 
            entity_type, 
            entity_id, 
            category,
            created_at
          )
        `)
        .eq('source_document_id', documentId);
      
      if (sourceError) throw sourceError;
      
      // Fetch relationships where this document is the target
      const { data: targetRelationships, error: targetError } = await supabase
        .from('document_relationships')
        .select(`
          id,
          source_document_id,
          target_document_id,
          relationship_type,
          relationship_metadata,
          created_at,
          updated_at,
          source_document:documents!source_document_id(
            document_id, 
            file_name, 
            file_type, 
            entity_type, 
            entity_id, 
            category,
            created_at
          )
        `)
        .eq('target_document_id', documentId);
      
      if (targetError) throw targetError;
      
      // Type validation and casting for relationship_type
      const validateRelationshipType = (type: string): RelationshipType => {
        const validTypes: RelationshipType[] = ['REFERENCE', 'VERSION', 'ATTACHMENT', 'RELATED', 'SUPPLEMENT'];
        return validTypes.includes(type as RelationshipType) 
          ? (type as RelationshipType) 
          : 'RELATED'; // Default to RELATED if type is invalid
      };
      
      // Process relationships safely
      const typedSourceRelationships = sourceRelationships ? sourceRelationships.map(rel => {
        return {
          ...rel,
          relationship_type: validateRelationshipType(rel.relationship_type),
          // Cast the document to ensure it has the correct shape
          target_document: rel.target_document as unknown as Document
        };
      }) : [];
      
      const typedTargetRelationships = targetRelationships ? targetRelationships.map(rel => {
        return {
          ...rel,
          relationship_type: validateRelationshipType(rel.relationship_type),
          // Cast the document to ensure it has the correct shape
          source_document: rel.source_document as unknown as Document
        };
      }) : [];
      
      // Combine relationships safely
      setRelationships([
        ...typedSourceRelationships,
        ...typedTargetRelationships
      ]);
    } catch (err: any) {
      console.error('Error fetching document relationships:', err);
      setError(err.message);
      toast({
        title: 'Error fetching relationships',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [documentId]);
  
  const createRelationship = useCallback(async ({
    sourceDocumentId,
    targetDocumentId,
    relationshipType,
    relationship_metadata
  }: CreateRelationshipParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for existing relationship
      const { data: existingRelationship, error: checkError } = await supabase
        .from('document_relationships')
        .select('id')
        .match({
          source_document_id: sourceDocumentId,
          target_document_id: targetDocumentId
        })
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRelationship) {
        throw new Error('A relationship already exists between these documents');
      }
      
      // Create the new relationship
      const { data, error } = await supabase
        .from('document_relationships')
        .insert({
          source_document_id: sourceDocumentId,
          target_document_id: targetDocumentId,
          relationship_type: relationshipType,
          relationship_metadata: relationship_metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Relationship created',
        description: 'Documents have been linked successfully',
      });
      
      // Refresh relationships
      await fetchRelationships();
      
      return data;
    } catch (err: any) {
      console.error('Error creating relationship:', err);
      setError(err.message);
      toast({
        title: 'Error creating relationship',
        description: err.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRelationships]);
  
  const deleteRelationship = useCallback(async (relationshipId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('document_relationships')
        .delete()
        .eq('id', relationshipId);
      
      if (error) throw error;
      
      toast({
        title: 'Relationship deleted',
        description: 'Document link has been removed',
      });
      
      // Update state to remove the deleted relationship
      setRelationships(prev => prev.filter(r => r.id !== relationshipId));
    } catch (err: any) {
      console.error('Error deleting relationship:', err);
      setError(err.message);
      toast({
        title: 'Error deleting relationship',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial fetch when component mounts
  useEffect(() => {
    if (documentId) {
      fetchRelationships();
    }
  }, [documentId, fetchRelationships]);
  
  return {
    relationships,
    loading,
    error,
    fetchRelationships,
    createRelationship,
    deleteRelationship,
  };
};
