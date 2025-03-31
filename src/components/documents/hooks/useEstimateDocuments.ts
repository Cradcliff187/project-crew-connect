
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export const useEstimateDocuments = (estimateId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTempId, setIsTempId] = useState(false);
  const fetchInProgress = useRef(false);
  const lastEstimateId = useRef<string | null>(null);
  const documentCacheRef = useRef<Map<string, Document>>(new Map());

  // Function to fetch documents with improved error handling
  const fetchDocuments = useCallback(async () => {
    // Skip if already fetching or if estimateId hasn't changed
    if (fetchInProgress.current) {
      console.log('Document fetch already in progress, skipping');
      return;
    }
    
    if (estimateId === lastEstimateId.current && documents.length > 0) {
      console.log('Using cached documents for estimateId:', estimateId);
      return;
    }

    fetchInProgress.current = true;
    lastEstimateId.current = estimateId;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!estimateId) {
        console.log('No estimateId provided, clearing documents');
        setDocuments([]);
        setIsTempId(false);
        return;
      }
      
      // Check if this is a temporary ID
      const isTemporaryId = estimateId.startsWith('temp-');
      setIsTempId(isTemporaryId);
      
      console.log(`Fetching documents for ${isTemporaryId ? 'temporary' : 'permanent'} estimate: ${estimateId}`);
      
      // For temporary IDs, use a simplified query
      if (isTemporaryId) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching temp documents:', error);
          setError('Failed to fetch documents');
          setDocuments([]);
          return;
        }
        
        // Process these documents with URLs
        const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
          let publicUrl = '';
          
          // Check cache first
          const cachedDoc = documentCacheRef.current.get(doc.document_id);
          if (cachedDoc?.url) {
            publicUrl = cachedDoc.url;
          } else {
            try {
              const { data: urlData } = supabase.storage
                .from('construction_documents')
                .getPublicUrl(doc.storage_path);
              
              publicUrl = urlData.publicUrl;
            } catch (err) {
              console.error('Error getting public URL:', err);
              publicUrl = '';
            }
          }
          
          const processedDoc = { 
            ...doc,
            url: publicUrl,
            item_reference: null,
            item_id: null,
            is_latest_version: doc.is_latest_version ?? true,
            mime_type: doc.mime_type || doc.file_type || 'application/octet-stream'
          } as Document;
          
          // Store in cache
          documentCacheRef.current.set(doc.document_id, processedDoc);
          
          return processedDoc;
        }));
        
        setDocuments(docsWithUrls);
        return;
      }
      
      // For real estimate IDs, perform the complete fetch logic
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} documents directly associated with estimate ${estimateId}`);
      
      // Transform the data to include document URLs
      const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
        let publicUrl = '';
        
        // Check cache first
        const cachedDoc = documentCacheRef.current.get(doc.document_id);
        if (cachedDoc?.url) {
          publicUrl = cachedDoc.url;
        } else {
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
        }
        
        // Check if this document is attached to an estimate item
        let itemDescription = '';
        if (doc.notes && doc.notes.includes('Item:')) {
          itemDescription = doc.notes.split('Item:')[1].trim();
        }
        
        const processedDoc = { 
          ...doc,
          url: publicUrl,
          item_reference: itemDescription || null,
          item_id: null, // Will be populated if this is a line item document
          is_latest_version: doc.is_latest_version ?? true,
          mime_type: doc.mime_type || doc.file_type || 'application/octet-stream'
        } as Document;
        
        // Store in cache
        documentCacheRef.current.set(doc.document_id, processedDoc);
        
        return processedDoc;
      }));
      
      // Only proceed with more advanced queries if this is a real estimate ID
      let additionalDocs: Document[] = [];
      
      if (!isTemporaryId) {
        // Additional query logic for revisions and items would go here
        // This is simplified to focus on fixing the core issue
      }
      
      // Combine and deduplicate documents
      const allDocs = [...docsWithUrls, ...additionalDocs];
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
      );
      
      console.log(`Found a total of ${uniqueDocs.length} unique documents for estimate ${estimateId}`);
      setDocuments(uniqueDocs);
    } catch (err: any) {
      console.error('Error fetching estimate documents:', err);
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [estimateId, documents.length]);

  // Only fetch when estimateId changes, not on every render
  useEffect(() => {
    if (estimateId) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
    
    // Cleanup on unmount or when estimateId changes
    return () => {
      fetchInProgress.current = false;
    };
  }, [estimateId, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetchDocuments: fetchDocuments,
    isTempId
  };
};
