import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

export const useEstimateDocuments = (estimateId: string, revisionId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const hasFetched = useRef(false);
  const previousEstimateId = useRef<string | null>(null);
  const previousRevisionId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const documentsCache = useRef<Record<string, Document[]>>({});
  const isMountedRef = useRef(true);

  // Debounce the estimateId to prevent multiple rapid fetches
  const debouncedEstimateId = useDebounce(estimateId, 500);
  const debouncedRevisionId = useDebounce(revisionId, 500);

  // Reset fetched state when estimateId or revisionId changes
  useEffect(() => {
    if (
      debouncedEstimateId !== previousEstimateId.current ||
      debouncedRevisionId !== previousRevisionId.current
    ) {
      hasFetched.current = false;
      previousEstimateId.current = debouncedEstimateId;
      previousRevisionId.current = debouncedRevisionId;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [debouncedEstimateId, debouncedRevisionId]);

  // Memoize the fetchDocuments function to prevent recreation on each render
  const fetchDocuments = useCallback(async () => {
    // Skip fetch if no estimateId, if we're already fetching, or if we've already fetched for this ID
    if (!debouncedEstimateId || !debouncedEstimateId.trim() || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    // Generate a cache key that includes both estimateId and revisionId
    const cacheKey = `${debouncedEstimateId}_${debouncedRevisionId || 'latest'}`;

    // Check cache first - if we have documents cached and this isn't a manual refetch
    if (documentsCache.current[cacheKey] && fetchCount === 0) {
      setDocuments(documentsCache.current[cacheKey]);
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

      // Create an array to collect documents from different sources
      let allDocuments: Document[] = [];
      let lineItemDocuments: { document_id: string; description: string; item_id: string }[] = [];

      // 1. Fetch documents associated directly with this estimate
      const { data: estimateDocuments, error: estimateError } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', debouncedEstimateId)
        .order('created_at', { ascending: false });

      if (estimateError) throw estimateError;

      // 2. If we have a revisionId, fetch documents linked to line items in this revision
      if (debouncedRevisionId) {
        // First get the line items that have document_id values
        const { data: lineItems, error: lineItemsError } = await supabase
          .from('estimate_items')
          .select('id, document_id, description')
          .eq('revision_id', debouncedRevisionId)
          .not('document_id', 'is', null);

        if (lineItemsError) throw lineItemsError;

        if (lineItems && lineItems.length > 0) {
          // Extract document IDs and descriptions for later use
          lineItemDocuments = lineItems.map(item => ({
            document_id: item.document_id,
            description: item.description,
            item_id: item.id,
          }));

          // Get the documents referenced by line items
          const documentIds = lineItems.map(item => item.document_id).filter(Boolean);

          if (documentIds.length > 0) {
            const { data: itemDocuments, error: itemDocumentsError } = await supabase
              .from('documents')
              .select('*')
              .in('document_id', documentIds);

            if (itemDocumentsError) throw itemDocumentsError;

            if (itemDocuments) {
              // Store these documents separately
              allDocuments = [...itemDocuments];
            }
          }
        }
      }

      // Add the estimate documents to our collection
      if (estimateDocuments) {
        allDocuments = [...allDocuments, ...estimateDocuments];
      }

      // Check if the request was aborted or component unmounted
      if (abortControllerRef.current?.signal.aborted || !isMountedRef.current) {
        return;
      }

      // Transform the data to include document URLs efficiently
      const docsWithUrls = await Promise.all(
        allDocuments.map(async doc => {
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

          // Find matching line item information if this document is from line items
          const lineItemMatch = lineItemDocuments.find(
            item => item.document_id === doc.document_id
          );

          return {
            ...doc,
            url: publicUrl,
            file_url: publicUrl,
            item_reference: lineItemMatch ? lineItemMatch.description : null,
            item_id: lineItemMatch ? lineItemMatch.item_id : null,
            is_latest_version: doc.is_latest_version ?? true,
            mime_type: doc.file_type || 'application/octet-stream',
          } as Document;
        })
      );

      // Store in cache only if component is still mounted
      if (isMountedRef.current) {
        documentsCache.current[cacheKey] = docsWithUrls;

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
  }, [debouncedEstimateId, debouncedRevisionId, fetchCount]);

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
    // Generate a cache key that includes both estimateId and revisionId
    const cacheKey = `${debouncedEstimateId}_${debouncedRevisionId || 'latest'}`;

    // Clear cache for this ID to force a fresh fetch
    if (documentsCache.current[cacheKey]) {
      delete documentsCache.current[cacheKey];
    }
    hasFetched.current = false;
    setFetchCount(prev => prev + 1);
  }, [debouncedEstimateId, debouncedRevisionId]);

  return {
    documents,
    loading,
    error,
    refetchDocuments,
  };
};
