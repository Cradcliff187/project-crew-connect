
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
      
      console.log(`Fetching documents for estimate: ${estimateId}`);
      
      // Try direct query from documents table
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log(`Found ${data.length} documents for estimate ${estimateId}`);
      
      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all(data.map(async (doc) => {
        let publicUrl = '';
        
        try {
          // Get the public URL for the document
          const { data: urlData } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          publicUrl = urlData.publicUrl;
        } catch (err) {
          console.error('Error getting public URL:', err);
          // Continue even if we can't get the URL
        }
        
        return { 
          ...doc,
          url: publicUrl,
          // Add any item reference if available
          item_reference: doc.notes && doc.notes.includes('Item:') ? doc.notes : null
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
