import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';

export const useRecentDocuments = () => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentDocumentsLoading, setRecentDocumentsLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch recent documents
  const fetchRecentDocuments = async () => {
    setRecentDocumentsLoading(true);
    try {
      // Fetch the 5 most recently created or modified documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      // Process the documents to get URLs
      const documentsWithUrls = await Promise.all(
        data.map(async doc => {
          if (doc.storage_path) {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 3600); // 1 hour expiration

            if (urlError) {
              console.error('Error generating signed URL:', urlError);
              return { ...doc, url: null };
            }

            return { ...doc, url: urlData?.signedUrl || null };
          }
          return { ...doc, url: null };
        })
      );

      setRecentDocuments(documentsWithUrls);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      toast({
        title: 'Failed to load recent documents',
        description: error.message,
        variant: 'destructive',
      });
      setRecentDocuments([]);
    } finally {
      setRecentDocumentsLoading(false);
    }
  };

  // Refresh documents function (doesn't take arguments)
  const refreshRecentDocuments = () => {
    fetchRecentDocuments();
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  return {
    recentDocuments,
    recentDocumentsLoading,
    refreshRecentDocuments,
  };
};
