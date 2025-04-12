
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const hasFetched = useRef(false);
  
  // Debounce the estimateId to prevent multiple rapid fetches
  const debouncedEstimateId = useDebounce(estimateId, 300);

  // Memoize the fetchDocuments function to prevent recreation on each render
  const fetchDocuments = useCallback(async () => {
    // Skip fetch if no estimateId, if we're already fetching, or if we've already fetched for this ID
    if (!debouncedEstimateId || !debouncedEstimateId.trim() || hasFetched.current) {
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
          url: publicUrl,           // Add url property
          file_url: publicUrl,      // Keep file_url for backward compatibility
          item_reference: itemDescription || null,
          item_id: null, // Will be populated if this is a line item document
          is_latest_version: doc.is_latest_version ?? true,
          // Use file_type if mime_type doesn't exist
          mime_type: doc.file_type || 'application/octet-stream'
        } as Document;
      }));
      
      // Set flag that we've fetched documents for this ID
      hasFetched.current = true;
      setDocuments(docsWithUrls);
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
      // Reset the fetched flag when the ID changes
      if (debouncedEstimateId !== estimateId) {
        hasFetched.current = false;
      }
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [debouncedEstimateId, fetchDocuments]);

  // Create a function to force a refresh of the documents
  const refetchDocuments = useCallback(() => {
    hasFetched.current = false;
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
