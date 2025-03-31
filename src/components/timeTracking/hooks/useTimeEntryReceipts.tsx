
import { useState, useEffect } from 'react';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Receipt {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  url?: string;
}

export function useTimeEntryReceipts(timeEntryId?: string) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) {
      setReceipts([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First get the document links
      const { data: links, error: linksError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (linksError) throw linksError;
      
      if (!links.length) {
        setReceipts([]);
        setIsLoading(false);
        return;
      }
      
      // Then get the documents
      const documentIds = links.map(link => link.document_id);
      
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (documentsError) throw documentsError;
      
      // Add signed URLs to the documents
      const receiptsWithUrls = await Promise.all(documents.map(async (doc) => {
        const { data: urlData } = await supabase
          .storage
          .from(DOCUMENTS_BUCKET_ID)
          .createSignedUrl(doc.storage_path, 60 * 5); // 5 minutes expiry
          
        return {
          ...doc,
          url: urlData?.signedUrl || undefined
        };
      }));
      
      setReceipts(receiptsWithUrls);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipt documents.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteReceipt = async (documentId: string) => {
    try {
      // First get the document to find its storage path
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
        
      if (docError) throw docError;
      
      // Delete the file from storage
      if (document?.storage_path) {
        const { error: storageError } = await supabase
          .storage
          .from(DOCUMENTS_BUCKET_ID)
          .remove([document.storage_path]);
          
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
        }
      }
      
      // Delete the document link
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('document_id', documentId);
        
      if (linkError) throw linkError;
      
      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (error) throw error;
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed successfully.'
      });
      
      // Refresh the receipts list
      fetchReceipts();
      
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the receipt. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  useEffect(() => {
    fetchReceipts();
  }, [timeEntryId]);
  
  return {
    receipts,
    isLoading,
    fetchReceipts,
    deleteReceipt
  };
}
