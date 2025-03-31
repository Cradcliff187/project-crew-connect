
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/components/documents/schemas/documentSchema';

export const useDocumentCount = (entityType: EntityType, entityId: string) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      if (!entityId) {
        setCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { count: documentCount, error } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
        
        if (error) {
          throw error;
        }
        
        setCount(documentCount || 0);
      } catch (err: any) {
        console.error(`Error fetching document count for ${entityType} ${entityId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [entityType, entityId]);

  return { count, loading, error };
};
