import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const hasFetched = useRef(false);
  const previousEstimateId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const documentsCache = useRef<Record<string, Document[]>>({});
  const isMountedRef = useRef(true);

  // Debounce the estimateId to prevent multiple rapid fetches
  const debouncedEstimateId = useDebounce(estimateId, 500);

  // Reset fetched state when estimateId changes
  useEffect(() => {
    if (debouncedEstimateId !== previousEstimateId.current) {
      hasFetched.current = false;
      previousEstimateId.current = debouncedEstimateId;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [debouncedEstimateId]);

  // Memoize the fetchDocuments function to prevent recreation on each render
  const fetchDocuments = useCallback(async () => {
    // Skip fetch if no estimateId, if we're already fetching, or if we've already fetched for this ID
    if (!debouncedEstimateId || !debouncedEstimateId.trim() || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    // Check cache first - if we have documents cached and this isn't a manual refetch
    if (documentsCache.current[debouncedEstimateId] && fetchCount === 0) {
      setDocuments(documentsCache.current[debouncedEstimateId]);
      setLoading(false);
      return;
    }

    // Skip if we've already fetched documents for this ID (but allow manual refetches)
    if (hasFetched.current && fetchCount === 0) {
      setLoading(false);
      return;
    }

    // Cancel any in-progress fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this fetch
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Fetch documents associated directly with this estimate
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', debouncedEstimateId)
        .order('created_at', { ascending: false });

      // Check if the request was aborted or component unmounted
      if (abortControllerRef.current?.signal.aborted || !isMountedRef.current) {
        return;
      }

      if (error) {
        throw error;
      }

      // Transform the data to include document URLs efficiently
      const docsWithUrls = await Promise.all(
        (data || []).map(async doc => {
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
            url: publicUrl,
            file_url: publicUrl,
            item_reference: itemDescription || null,
            item_id: null,
            is_latest_version: doc.is_latest_version ?? true,
            mime_type: doc.file_type || 'application/octet-stream',
          } as Document;
        })
      );

      // Store in cache only if component is still mounted
      if (isMountedRef.current) {
        documentsCache.current[debouncedEstimateId] = docsWithUrls;

        // Set flag that we've fetched documents for this ID
        hasFetched.current = true;
        setDocuments(docsWithUrls);
      }
    } catch (err: any) {
      // Only set error if the request wasn't aborted and component is mounted
      if (!abortControllerRef.current?.signal.aborted && isMountedRef.current) {
        console.error('Error fetching estimate documents:', err);
        setError(err.message);
      }
    } finally {
      // Only update loading state if the request wasn't aborted and component is mounted
      if (!abortControllerRef.current?.signal.aborted && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedEstimateId, fetchCount]);

  // Use effect with appropriate dependencies
  useEffect(() => {
    fetchDocuments();

    // Clean up function to abort any in-progress fetch when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDocuments]);

  // Create a function to force a refresh of the documents
  const refetchDocuments = useCallback(() => {
    // Clear cache for this ID to force a fresh fetch
    if (documentsCache.current[debouncedEstimateId]) {
      delete documentsCache.current[debouncedEstimateId];
    }
    hasFetched.current = false;
    setFetchCount(prev => prev + 1);
  }, [debouncedEstimateId]);

  return {
    documents,
    loading,
    error,
    refetchDocuments,
  };
};
