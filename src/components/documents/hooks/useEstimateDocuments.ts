
import { useState, useEffect } from 'react';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export function useEstimateDocuments(estimateId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!estimateId) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // First fetch direct estimate documents
        const { data: directDocs, error: directError } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId);
          
        if (directError) throw directError;
        
        // Check if this is a temporary ID (starts with "temp-")
        const isTemporaryEstimate = estimateId.startsWith('temp-');
        
        let lineItemDocs: any[] = [];
        
        // For temporary estimates, we shouldn't try to join with estimate_items
        // as they might not be saved in the database yet
        if (!isTemporaryEstimate) {
          // Only attempt to fetch line item documents with JOIN for permanent estimates
          try {
            const { data, error: lineItemError } = await supabase
              .from('documents')
              .select('*, estimate_items!inner(id, description)')
              .eq('entity_type', 'ESTIMATE_ITEM')
              .eq('estimate_items.estimate_id', estimateId);
              
            if (!lineItemError && data) {
              lineItemDocs = data;
            }
          } catch (err) {
            console.warn('Could not fetch line item documents with join:', err);
            
            // Fallback: Just get ESTIMATE_ITEM documents without the join
            const { data: fallbackData } = await supabase
              .from('documents')
              .select('*')
              .eq('entity_type', 'ESTIMATE_ITEM')
              .filter('entity_id', 'like', `${estimateId}-%`);
              
            lineItemDocs = fallbackData || [];
          }
        } else {
          // For temporary estimates, just look for documents with entity_id
          // that includes the temp ID pattern
          const { data: tempItemDocs } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_type', 'ESTIMATE_ITEM')
            .filter('entity_id', 'like', `${estimateId}-%`);
            
          lineItemDocs = tempItemDocs || [];
        }
        
        // Combine and process
        const allDocs = [
          ...(directDocs || []).map(doc => ({
            ...doc,
            is_line_item_doc: false
          })),
          ...(lineItemDocs || []).map(doc => ({
            ...doc,
            is_line_item_doc: true,
            item_reference: doc.estimate_items ? 
              `Item: ${doc.estimate_items.description}` : 
              'Line Item Document'
          }))
        ];
        
        // Add URLs to all documents
        const docsWithUrls = await Promise.all(
          allDocs.map(async (doc) => {
            if (doc.storage_path) {
              const { data: urlData } = await supabase.storage
                .from(DOCUMENTS_BUCKET_ID)
                .createSignedUrl(doc.storage_path, 300);
                
              if (urlData) {
                return {
                  ...doc,
                  url: urlData.signedUrl
                };
              }
            }
            
            return {
              ...doc,
              url: ''
            };
          })
        );
        
        setDocuments(docsWithUrls as Document[]);
      } catch (err: any) {
        console.error('Error fetching estimate documents:', err);
        setError(err.message || 'An error occurred while fetching documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [estimateId, refreshTrigger]);
  
  const refetchDocuments = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return { documents, loading, error, refetchDocuments };
}
