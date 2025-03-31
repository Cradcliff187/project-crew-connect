
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!estimateId) {
        setDocuments([]);
        return;
      }
      
      // First try to get documents from the estimate_consolidated_documents view
      const { data: viewData, error: viewError } = await supabase
        .from('estimate_consolidated_documents')
        .select('*')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (viewError) {
        console.error('Error fetching from consolidated view:', viewError);
        // Fall back to direct table query
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform the data to include document URLs
        const docsWithUrls = await Promise.all(data.map(async (doc) => {
          const { data: { publicUrl } } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return { 
            ...doc,
            url: publicUrl
          };
        }));
        
        setDocuments(docsWithUrls);
        return;
      }
      
      // Transform the data from the view to include document URLs
      const docsWithUrls = await Promise.all(viewData.map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return { 
          ...doc,
          url: publicUrl,
          // Add a reference to the item description if available
          item_reference: doc.item_description ? `Item: ${doc.item_description}` : null
        };
      }));
      
      setDocuments(docsWithUrls);
    } catch (err: any) {
      console.error('Error fetching estimate documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estimateId) {
      fetchDocuments();
    }
  }, [estimateId]);

  const refetchDocuments = () => {
    fetchDocuments();
  };

  return {
    documents,
    loading,
    error,
    refetchDocuments
  };
};
