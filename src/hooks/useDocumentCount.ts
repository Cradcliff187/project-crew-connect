
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/components/documents/schemas/documentSchema';

export const useDocumentCount = (entityType: EntityType, entityId: string) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocumentCount = async () => {
      try {
        setLoading(true);
        
        const { count, error } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
        
        if (error) {
          console.error('Error fetching document count:', error);
          return;
        }
        
        setCount(count || 0);
      } catch (error) {
        console.error('Error in document count hook:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (entityId) {
      fetchDocumentCount();
    }
  }, [entityType, entityId]);
  
  return { count, loading };
};
