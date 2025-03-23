
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderDocument } from '../details/DocumentsList/types';

export const useWorkOrderDocumentsEmbed = (workOrderId: string, entityType: string) => {
  const [documents, setDocuments] = useState<WorkOrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', workOrderId);
        
        if (error) {
          console.error('Error fetching documents:', error);
          setError(error.message);
          return;
        }
        
        // Process the documents to get public URLs
        const docsWithUrls = await Promise.all(
          data.map(async (doc) => {
            const { data: urlData } = await supabase
              .storage
              .from('construction_documents') // Using the correct bucket name
              .getPublicUrl(doc.storage_path);
            
            return {
              ...doc,
              document_id: doc.document_id,
              url: urlData.publicUrl
            } as WorkOrderDocument;
          })
        );
        
        setDocuments(docsWithUrls);
      } catch (err) {
        console.error('Error in useWorkOrderDocumentsEmbed:', err);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
    
    if (workOrderId) {
      fetchDocuments();
    }
  }, [workOrderId, entityType, refreshTrigger]);
  
  const refetchDocuments = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    documents,
    loading,
    error,
    refetchDocuments
  };
};
