import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

export const useRecentDocuments = (limit = 3) => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentDocumentsLoading, setRecentDocumentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecentDocuments = useCallback(async () => {
    try {
      setRecentDocumentsLoading(true);
      setError(null);

      // Fetch recent documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Process the documents to get signed URLs
      const processedDocuments: Document[] = await Promise.all(
        data.map(async doc => {
          let url = '';
          if (doc.storage_path) {
            try {
              const { data: urlData, error: urlError } = await supabase.storage
                .from('construction_documents')
                .createSignedUrl(doc.storage_path, 300, {
                  transform: {
                    width: 400,
                    height: 400,
                    quality: 80,
                  },
                });

              if (!urlError) {
                url = urlData.signedUrl;
              }
            } catch (error) {
              console.error('Error generating URL:', error);
            }
          }

          return {
            ...doc,
            url,
          };
        })
      );

      setRecentDocuments(processedDocuments);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      setError(error.message);
    } finally {
      setRecentDocumentsLoading(false);
    }
  }, [limit]);

  // Fetch recent documents on mount
  useEffect(() => {
    refreshRecentDocuments();
  }, [refreshRecentDocuments]);

  return {
    recentDocuments,
    recentDocumentsLoading,
    error,
    refreshRecentDocuments,
  };
};
