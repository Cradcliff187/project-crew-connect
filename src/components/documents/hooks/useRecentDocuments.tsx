
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { useToast } from '@/hooks/use-toast';

export const useRecentDocuments = (limit: number = 3) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecentDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch the most recently created documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      // Get document URLs
      const docsWithUrls = await Promise.all(data.map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return { ...doc, url: publicUrl };
      }));
      
      setDocuments(docsWithUrls);
    } catch (error: any) {
      console.error('Error fetching recent documents:', error);
      toast({
        title: "Error loading recent documents",
        description: error.message,
        variant: "destructive"
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  return {
    recentDocuments: documents,
    recentDocumentsLoading: loading,
    refreshRecentDocuments: fetchRecentDocuments
  };
};
