import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { parseEntityType } from '@/components/documents/utils/documentTypeUtils';

export interface TimeEntryReceipt extends Document {
  url?: string;
}

export function useTimeEntryReceipts(timeEntryId: string | undefined) {
  const [receipts, setTimeEntryReceipts] = useState<TimeEntryReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) return;
    
    setIsLoading(true);
    try {
      // First get document IDs linked to this time entry
      const { data: links, error: linksError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (linksError) throw linksError;
      
      if (!links || links.length === 0) {
        setTimeEntryReceipts([]);
        return;
      }
      
      // Get document details
      const documentIds = links.map(link => link.document_id);
      
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (documentsError) throw documentsError;
      
      // Get signed URLs for each document
      const receiptsWithUrls = await Promise.all((documentsData || []).map(async (doc) => {
        let url = '';
        if (doc.storage_path) {
          const { data } = await supabase.storage
            .from('construction_documents')
            .createSignedUrl(doc.storage_path, 3600);
            
          if (data) {
            url = data.signedUrl;
          }
        }
        
        return {
          ...doc,
          url
        };
      }));
      
      // Convert data to TimeEntryReceipt objects
      const receipts = (receiptsWithUrls || []).map(doc => ({
        ...doc,
        entity_type: parseEntityType(doc.entity_type) // Convert string to EntityType enum
      }));
      
      setTimeEntryReceipts(receipts);
    } catch (error: any) {
      console.error('Error fetching time entry receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipts for this time entry.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteReceipt = async (documentId: string) => {
    if (!timeEntryId || !documentId) return false;
    
    try {
      // First remove the link
      const { error: unlinkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', timeEntryId)
        .eq('document_id', documentId);
        
      if (unlinkError) throw unlinkError;
      
      // Get the storage path before deleting the document
      const { data: docData } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('document_id', documentId)
        .single();
      
      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (deleteError) throw deleteError;
      
      // Delete the file from storage if we have a path
      if (docData?.storage_path) {
        await supabase.storage
          .from('construction_documents')
          .remove([docData.storage_path]);
      }
      
      // Check if time entry has any remaining receipts
      const { count } = await supabase
        .from('time_entry_document_links')
        .select('*', { count: 'exact' })
        .eq('time_entry_id', timeEntryId);
      
      // Update the time entry has_receipts flag
      await supabase
        .from('time_entries')
        .update({ has_receipts: count && count > 0 })
        .eq('id', timeEntryId);
      
      // Refresh the receipts list
      fetchReceipts();
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed successfully.'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete receipt.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Fetch receipts when the component loads or timeEntryId changes
  useEffect(() => {
    if (timeEntryId) {
      fetchReceipts();
    }
  }, [timeEntryId]);
  
  return {
    receipts,
    isLoading,
    fetchReceipts,
    deleteReceipt
  };
}
