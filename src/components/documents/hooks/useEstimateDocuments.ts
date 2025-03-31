
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
      
      // Fetch documents associated with this estimate
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} documents for estimate ${estimateId}`);
      
      if (!data || data.length === 0) {
        setDocuments([]);
        return;
      }
      
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
        
        // Check if this document is attached to an estimate item
        let itemDescription = '';
        if (doc.notes && doc.notes.includes('Item:')) {
          itemDescription = doc.notes.split('Item:')[1].trim();
        }
        
        return { 
          ...doc,
          url: publicUrl,
          item_reference: itemDescription || null,
          item_id: null // Will be populated if this is a line item document
        };
      }));
      
      // Additionally, fetch documents attached to estimate items
      const { data: currentRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimateId)
        .eq('is_current', true)
        .maybeSingle();
        
      if (!revisionError && currentRevision) {
        const { data: items, error: itemsError } = await supabase
          .from('estimate_items')
          .select('id, description, document_id')
          .eq('estimate_id', estimateId)
          .eq('revision_id', currentRevision.id)
          .not('document_id', 'is', null);
          
        if (!itemsError && items && items.length > 0) {
          console.log(`Found ${items.length} items with attached documents`);
          
          // Get the unique document IDs
          const documentIds = items.map(item => item.document_id).filter(Boolean);
          
          if (documentIds.length > 0) {
            const { data: itemDocuments, error: itemDocsError } = await supabase
              .from('documents')
              .select('*')
              .in('document_id', documentIds);
              
            if (!itemDocsError && itemDocuments) {
              // Process these documents and add them to our array
              const itemDocsWithUrls = await Promise.all(itemDocuments.map(async (doc) => {
                let publicUrl = '';
                
                try {
                  const { data: urlData } = supabase.storage
                    .from('construction_documents')
                    .getPublicUrl(doc.storage_path);
                  
                  publicUrl = urlData.publicUrl;
                } catch (err) {
                  console.error('Error getting public URL:', err);
                }
                
                // Find the related item for this document
                const relatedItem = items.find(item => item.document_id === doc.document_id);
                
                return { 
                  ...doc,
                  url: publicUrl,
                  item_reference: relatedItem ? `Item: ${relatedItem.description}` : null,
                  item_id: relatedItem ? relatedItem.id : null
                };
              }));
              
              // Add these documents to our array
              docsWithUrls.push(...itemDocsWithUrls);
            }
          }
        }
      }
      
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
