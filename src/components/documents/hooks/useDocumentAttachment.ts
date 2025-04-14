import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntityType } from '../schemas/documentSchema';

interface AttachDocumentOptions {
  documentId: string;
  entityId: string;
  entityType: EntityType;
  metadata?: {
    amount?: number;
    isExpense?: boolean;
    expenseType?: string;
    notes?: string;
  };
}

export function useDocumentAttachment() {
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Attaches a document to an entity
   */
  const attachDocument = async ({
    documentId,
    entityId,
    entityType,
    metadata,
  }: AttachDocumentOptions): Promise<boolean> => {
    if (!documentId || !entityId || !entityType) {
      setError('Missing required document or entity information');
      return false;
    }

    setIsAttaching(true);
    setError(null);

    try {
      console.log(`Attaching document ${documentId} to ${entityType} ${entityId}`);

      // Update the document with the new entity information
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          entity_id: entityId,
          entity_type: entityType,
          ...(metadata || {}),
        })
        .eq('document_id', documentId);

      if (updateError) {
        throw updateError;
      }

      // Special handling for specific entity types
      if (entityType === 'TIME_ENTRY') {
        // Use the stored function to create the link
        const { error: linkError } = await supabase.rpc('attach_document_to_time_entry', {
          p_time_entry_id: entityId,
          p_document_id: documentId,
        });

        if (linkError) {
          throw linkError;
        }
      }

      toast({
        title: 'Document attached',
        description: `Document successfully attached to ${entityType.replace(/_/g, ' ').toLowerCase()}`,
      });

      return true;
    } catch (err: any) {
      console.error('Error attaching document:', err);
      setError(err.message || 'Failed to attach document');

      toast({
        title: 'Error',
        description: err.message || 'Failed to attach document',
        variant: 'destructive',
      });

      return false;
    } finally {
      setIsAttaching(false);
    }
  };

  /**
   * Detaches a document from an entity
   */
  const detachDocument = async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      setError('Document ID is required');
      return false;
    }

    setIsAttaching(true);
    setError(null);

    try {
      // Get the current document to know what type of entity it's attached to
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('entity_type, entity_id')
        .eq('document_id', documentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // If it's a TIME_ENTRY document, remove from the link table
      if (document?.entity_type === 'TIME_ENTRY') {
        const { error: unlinkError } = await supabase
          .from('time_entry_document_links')
          .delete()
          .eq('document_id', documentId);

        if (unlinkError) {
          throw unlinkError;
        }
      }

      // Update the document to detach from entity
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          entity_id: 'detached',
          entity_type: 'DETACHED',
          is_expense: false,
        })
        .eq('document_id', documentId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Document detached',
        description: 'Document successfully detached from entity',
      });

      return true;
    } catch (err: any) {
      console.error('Error detaching document:', err);
      setError(err.message || 'Failed to detach document');

      toast({
        title: 'Error',
        description: err.message || 'Failed to detach document',
        variant: 'destructive',
      });

      return false;
    } finally {
      setIsAttaching(false);
    }
  };

  return {
    attachDocument,
    detachDocument,
    isAttaching,
    error,
  };
}
