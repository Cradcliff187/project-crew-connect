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
      const docsWithUrls = await Promise.all(
        data.map(async doc => {
          const {
            data: { publicUrl },
          } = supabase.storage.from('construction_documents').getPublicUrl(doc.storage_path);

          return { ...doc, url: publicUrl };
        })
      );

      setRecentDocuments(docsWithUrls);
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
