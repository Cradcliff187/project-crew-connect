
import { useState, useEffect } from 'react';
import { fetchTimeEntryReceipts, deleteReceipt } from '../utils/receiptUtils';
import { toast } from '@/hooks/use-toast';

interface Receipt {
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  url: string;
  tags?: string[];
  expense_type?: string;
  category?: string;
  amount?: number;
  vendor_id?: string;
}

export function useTimeEntryReceipts(timeEntryId?: string) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedReceipts = await fetchTimeEntryReceipts(timeEntryId);
      setReceipts(loadedReceipts);
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
