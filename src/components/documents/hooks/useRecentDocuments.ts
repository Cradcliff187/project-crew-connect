
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { parseEntityType } from '../utils/documentTypeUtils';

export const useRecentDocuments = (limit: number = 10) => {
  const { data: documents, isLoading, error, refetch } = useQuery({
    queryKey: ['recentDocuments', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      // Convert entity_type strings to EntityType enum values
      const processedDocuments: Document[] = data.map(doc => ({
        ...doc,
        entity_type: parseEntityType(doc.entity_type)
      }));
      
      return processedDocuments;
    }
  });
  
  return {
    documents: documents || [],
    isLoading,
    error,
    refetch
  };
};
