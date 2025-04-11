
import { useState, useEffect } from 'react';
import { fetchTimeEntryReceipts, deleteReceipt } from '../utils/receiptUtils';
import { TimeEntryReceipt } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';

export function useTimeEntryReceipts(timeEntryId?: string) {
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedReceipts = await fetchTimeEntryReceipts(timeEntryId);
      // Transform the data to ensure it matches the TimeEntryReceipt interface
      const formattedReceipts: TimeEntryReceipt[] = loadedReceipts.map(receipt => ({
        id: receipt.id || receipt.document_id,
        document_id: receipt.document_id,
        time_entry_id: timeEntryId,
        file_name: receipt.file_name,
        file_type: receipt.file_type,
        file_size: receipt.file_size,
        storage_path: receipt.storage_path,
        uploaded_at: receipt.created_at, // Use created_at as uploaded_at if not available
        created_at: receipt.created_at,
        url: receipt.url,
        expense_type: receipt.expense_type,
        vendor_id: receipt.vendor_id,
        amount: receipt.amount,
        category: receipt.category,
        tags: receipt.tags
      }));
      
      setReceipts(formattedReceipts);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to load receipts');
      
      toast({
        title: 'Error loading receipts',
        description: err.message || 'There was a problem loading the receipts.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteReceipt = async (documentId: string): Promise<boolean> => {
    if (!timeEntryId || !documentId) return false;
    
    const success = await deleteReceipt(timeEntryId, documentId);
    
    if (success) {
      // Update the local state by filtering out the deleted receipt
      setReceipts(current => current.filter(r => r.document_id !== documentId));
    }
    
    return success;
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
    deleteReceipt: handleDeleteReceipt
  };
}
