
import { useState } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<WorkOrderExpense | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const [receiptDocument, setReceiptDocument] = useState<Document | null>(null);
  
  const fetchReceiptDocument = async (documentId: string) => {
    try {
      console.log('Fetching receipt document:', documentId);
      
      // First get the document data from the database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (error) {
        console.error('Error fetching document record:', error);
        throw error;
      }
      
      console.log('Retrieved document data:', data);
      
      if (!data.storage_path) {
        console.error('Document has no storage path:', data);
        throw new Error('Document has no storage path');
      }
      
      // Generate signed URL for the document with the correct bucket name
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('construction_documents')
        .createSignedUrl(data.storage_path, 300); // 5 minutes expiration
      
      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        throw urlError;
      }
      
      console.log('Generated signed URL:', urlData);
      
      // Return the document with URL and additional properties
      return { 
        ...data, 
        url: urlData.signedUrl,
        file_type: data.file_type || 'application/octet-stream', // Ensure we have a file type
        file_name: data.file_name || 'receipt.png' // Ensure we have a file name
      } as Document;
    } catch (error: any) {
      console.error('Error fetching receipt document:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipt: ' + error.message,
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const handleReceiptClick = async (expense: WorkOrderExpense) => {
    if (expense.receipt_document_id) {
      console.log('Viewing existing receipt for expense:', expense.id);
      // Fetch and view existing receipt
      const document = await fetchReceiptDocument(expense.receipt_document_id);
      if (document) {
        setReceiptDocument(document);
        setViewingReceipt(true);
      }
    } else {
      console.log('Setting up receipt upload for expense:', expense.id);
      // Upload new receipt
      setSelectedExpense(expense);
      setShowReceiptUpload(true);
    }
  };
  
  const handleCloseReceiptViewer = () => {
    setViewingReceipt(false);
    setReceiptDocument(null);
  };
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedExpense,
    setSelectedExpense,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  };
}
