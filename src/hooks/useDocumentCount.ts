
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDocumentCountResult {
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDocumentCount(
  entityType: string,
  entityId: string
): UseDocumentCountResult {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!entityId || !entityType) {
        setCount(0);
        return;
      }

      // Query to count documents for this entity
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        throw error;
      }

      setCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching document count:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [entityType, entityId]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount
  };
}
