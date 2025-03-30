
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adaptDatabaseDocuments } from '@/utils/typeUtils';

export interface TimeEntryReceipt {
  document_id: string;
  file_name: string;
  file_type?: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  url?: string;
  // Additional fields needed for receipts
  amount?: number;
  expense_type?: string;
  category?: string;
}

export const useTimeEntryReceipts = (timeEntryId: string) => {
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = async () => {
    if (!timeEntryId) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First get document IDs from time entry links
      const { data: linkData, error: linkError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (linkError) {
        throw linkError;
      }
      
      if (!linkData || linkData.length === 0) {
        setReceipts([]);
        return;
      }
      
      // Get the document IDs from the links
      const documentIds = linkData.map(link => link.document_id);
      
      // Fetch the actual documents
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (documentError) {
        throw documentError;
      }
      
      if (!documentData) {
        setReceipts([]);
        return;
      }
      
      // Generate signed URLs for each document
      const receiptsWithUrls = await Promise.all(
        documentData.map(async (doc) => {
          let url = '';
          
          if (doc.storage_path) {
            const { data: urlData } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 3600); // 1 hour expiration
              
            if (urlData) {
              url = urlData.signedUrl;
            }
          }
          
          return { ...doc, url };
        })
      );
      
      // Adapt documents to ensure type safety
      const adaptedReceipts = receiptsWithUrls.map(receipt => ({
        ...receipt,
        url: receipt.url || '',
      })) as TimeEntryReceipt[];
      
      setReceipts(adaptedReceipts);
    } catch (err: any) {
      console.error('Error fetching time entry receipts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [timeEntryId]);

  const refetchReceipts = () => {
    fetchReceipts();
  };

  return {
    receipts,
    loading,
    error,
    refetchReceipts
  };
};
