
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeEntryReceipt } from '@/types/timeTracking';

export function useTimeEntryReceipts(timeEntryId?: string) {
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching receipts for time entry ID: ${timeEntryId}`);
      
      // First get the document IDs linked to this time entry
      const { data: links, error: linksError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (linksError) {
        console.error('Error fetching document links:', linksError);
        throw linksError;
      }
      
      console.log(`Found ${links?.length || 0} document links`);
      
      if (!links || links.length === 0) {
        setReceipts([]);
        return;
      }
      
      // Get the document details for each ID
      const documentIds = links.map(link => link.document_id);
      
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }
      
      console.log(`Retrieved ${documents?.length || 0} document records`);
      
      if (!documents || documents.length === 0) {
        setReceipts([]);
        return;
      }
      
      // Get URLs for each document
      const receiptsWithUrls = await Promise.all(documents.map(async (doc) => {
        try {
          const { data, error: urlError } = await supabase
            .storage
            .from('construction_documents')
            .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour expiry
            
          if (urlError) {
            console.error('Error creating signed URL:', urlError);
            return {
              // Ensure we have all the required fields for TimeEntryReceipt
              id: doc.document_id,
              document_id: doc.document_id,
              time_entry_id: timeEntryId,
              file_name: doc.file_name,
              file_type: doc.file_type,
              file_size: doc.file_size,
              storage_path: doc.storage_path,
              uploaded_at: doc.created_at,
              created_at: doc.created_at,
              url: '',
              expense_type: doc.expense_type,
              vendor_id: doc.vendor_id,
              amount: doc.amount,
              category: doc.category,
              tags: doc.tags
            } as TimeEntryReceipt;
          }
          
          return {
            // Map all fields to the TimeEntryReceipt interface
            id: doc.document_id,
            document_id: doc.document_id,
            time_entry_id: timeEntryId,
            file_name: doc.file_name,
            file_type: doc.file_type,
            file_size: doc.file_size,
            storage_path: doc.storage_path,
            uploaded_at: doc.created_at,
            created_at: doc.created_at,
            url: data?.signedUrl || '',
            expense_type: doc.expense_type,
            vendor_id: doc.vendor_id,
            amount: doc.amount,
            category: doc.category,
            tags: doc.tags
          } as TimeEntryReceipt;
        } catch (e) {
          console.error('Error generating URL for document:', e);
          return {
            id: doc.document_id,
            document_id: doc.document_id,
            time_entry_id: timeEntryId,
            file_name: doc.file_name,
            file_type: doc.file_type,
            file_size: doc.file_size,
            storage_path: doc.storage_path,
            uploaded_at: doc.created_at,
            created_at: doc.created_at,
            url: '',
            expense_type: doc.expense_type,
            vendor_id: doc.vendor_id,
            amount: doc.amount,
            category: doc.category,
            tags: doc.tags
          } as TimeEntryReceipt;
        }
      }));
      
      setReceipts(receiptsWithUrls);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteReceipt = async (documentId: string): Promise<boolean> => {
    if (!timeEntryId || !documentId) return false;
    
    try {
      console.log(`Deleting receipt: document ID ${documentId}, time entry ID ${timeEntryId}`);
      
      // First remove the link between time entry and document
      const { error: unlinkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', timeEntryId)
        .eq('document_id', documentId);
        
      if (unlinkError) {
        console.error('Error removing document link:', unlinkError);
        throw unlinkError;
      }
      
      // Get the document details to delete the file from storage
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
        
      if (docError) {
        console.error('Error fetching document details:', docError);
        throw docError;
      }
      
      // Delete the document record
      const { error: deleteDocError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteDocError) {
        console.error('Error deleting document record:', deleteDocError);
        throw deleteDocError;
      }
      
      // Delete the file from storage
      if (document?.storage_path) {
        const { error: storageError } = await supabase
          .storage
          .from('construction_documents')
          .remove([document.storage_path]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue even if storage removal fails - the document is already unlinked
        }
      }
      
      // Check if the time entry has other receipts
      const { data: remainingLinks, error: countError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (countError) {
        console.error('Error checking remaining links:', countError);
        throw countError;
      }
      
      // Update the time_entry has_receipts flag based on remaining receipts
      const { error: updateError } = await supabase
        .from('time_entries')
        .update({ has_receipts: (remainingLinks || []).length > 0 })
        .eq('id', timeEntryId);
        
      if (updateError) {
        console.error('Error updating time entry:', updateError);
        throw updateError;
      }
      
      // Refresh the receipts list
      await fetchReceipts();
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been successfully deleted.',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      
      toast({
        title: 'Error deleting receipt',
        description: err.message || 'There was an error deleting the receipt.',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  // Fetch receipts when timeEntryId changes
  useEffect(() => {
    if (timeEntryId) {
      fetchReceipts();
    } else {
      setReceipts([]);
    }
  }, [timeEntryId]);
  
  return {
    receipts,
    isLoading,
    error,
    fetchReceipts,
    deleteReceipt
  };
}
