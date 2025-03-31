
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDocumentCountProps {
  entityType: string;
  entityId: string;
}

export const useDocumentCount = (entityType: string, entityId: string) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        
        if (!entityId || !entityType) {
          setCount(0);
          return;
        }
        
        const { count: documentCount, error } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType.toUpperCase())
          .eq('entity_id', entityId);
          
        if (error) {
          throw error;
        }
        
        setCount(documentCount || 0);
      } catch (err: any) {
        console.error('Error fetching document count:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCount();
  }, [entityType, entityId]);

  return { count, loading, error };
};
