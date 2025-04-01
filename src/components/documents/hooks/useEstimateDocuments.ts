
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  
  // Debounce the estimateId to prevent multiple rapid fetches
  const debouncedEstimateId = useDebounce(estimateId, 300);

  // Memoize the fetchDocuments function to prevent recreation on each render
  const fetchDocuments = useCallback(async () => {
    // Skip fetch if no estimateId or if we're already fetching
    if (!debouncedEstimateId || !debouncedEstimateId.trim()) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching documents for estimate: ${debouncedEstimateId}`);
      
      // Fetch documents associated directly with this estimate
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', debouncedEstimateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
        let publicUrl = '';
        
        try {
          // Get the public URL for the document
          const { data: urlData } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          publicUrl = urlData.publicUrl;
        } catch (err) {
          console.error('Error getting public URL:', err);
          publicUrl = ''; // Set default empty URL on error
        }
        
        // Check if this document is attached to an estimate item
        let itemDescription = '';
        if (doc.notes && doc.notes.includes('Item:')) {
          itemDescription = doc.notes.split('Item:')[1].trim();
        }
        
        return { 
          ...doc,
          file_url: publicUrl,
          item_reference: itemDescription || null,
          item_id: null, // Will be populated if this is a line item document
          is_latest_version: doc.is_latest_version ?? true,
          // Use file_type if mime_type doesn't exist
          mime_type: doc.file_type || 'application/octet-stream'
        } as Document;
      }));
      
      // Fetch all revisions for this estimate, not just the current one
      const { data: allRevisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', debouncedEstimateId);
        
      if (revisionsError) {
        console.error('Error fetching estimate revisions:', revisionsError);
      }
      
      let itemDocuments: Document[] = [];
      
      // If we have revisions, fetch documents for items in each revision
      if (allRevisions && allRevisions.length > 0) {
        const revisionIds = allRevisions.map(rev => rev.id);
        
        // Fetch all items that have document associations for all revisions
        const { data: items, error: itemsError } = await supabase
          .from('estimate_items')
          .select('id, description, document_id, revision_id')
          .eq('estimate_id', debouncedEstimateId)
          .in('revision_id', revisionIds)
          .not('document_id', 'is', null);
          
        if (!itemsError && items && items.length > 0) {
          // Get the unique document IDs
          const documentIds = items.map(item => item.document_id).filter(Boolean);
          
          if (documentIds.length > 0) {
            const { data: itemDocData, error: itemDocsError } = await supabase
              .from('documents')
              .select('*')
              .in('document_id', documentIds);
              
            if (!itemDocsError && itemDocData) {
              // Process these documents and add them to our array
              const itemDocsWithUrls = await Promise.all(itemDocData.map(async (doc) => {
                let publicUrl = '';
                
                try {
                  const { data: urlData } = supabase.storage
                    .from('construction_documents')
                    .getPublicUrl(doc.storage_path);
                  
                  publicUrl = urlData.publicUrl;
                } catch (err) {
                  console.error('Error getting public URL:', err);
                  publicUrl = ''; // Set default empty URL on error
                }
                
                // Find the related item for this document
                const relatedItem = items.find(item => item.document_id === doc.document_id);
                
                return { 
                  ...doc,
                  file_url: publicUrl,
                  item_reference: relatedItem ? `Item: ${relatedItem.description}` : null,
                  item_id: relatedItem ? relatedItem.id : null,
                  revision_id: relatedItem?.revision_id,
                  is_latest_version: doc.is_latest_version ?? true,
                  // Use file_type if mime_type doesn't exist
                  mime_type: doc.file_type || 'application/octet-stream'
                } as Document;
              }));
              
              itemDocuments = itemDocsWithUrls;
            }
          }
        }
      }
      
      // Add item documents to our collection
      docsWithUrls.push(...itemDocuments);
      
      // Remove any duplicate documents (by document_id)
      const uniqueDocs = Array.from(
        new Map(docsWithUrls.map(doc => [doc.document_id, doc])).values()
      );
      
      setDocuments(uniqueDocs);
    } catch (err: any) {
      console.error('Error fetching estimate documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedEstimateId]);

  // Use effect to fetch documents when estimate ID changes
  useEffect(() => {
    if (debouncedEstimateId) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [debouncedEstimateId, fetchDocuments]);

  // Create a debounced refetch function to prevent multiple rapid refetches
  const refetchDocuments = useCallback(() => {
    setFetchCount(prev => prev + 1);
  }, []);

  // Only actually fetch when the fetchCount changes
  useEffect(() => {
    if (fetchCount > 0) {
      fetchDocuments();
    }
  }, [fetchCount, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetchDocuments
  };
};
