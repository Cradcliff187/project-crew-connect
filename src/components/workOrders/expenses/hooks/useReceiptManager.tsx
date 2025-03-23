
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
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Retrieved document data:', data);
      
      if (!data.storage_path) {
        throw new Error('Document has no storage path');
      }
      
      // Use the correct bucket name - construction_documents instead of documents
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('construction_documents') // Changed from 'documents' to 'construction_documents'
        .createSignedUrl(data.storage_path, 60); // 60 seconds expiration
      
      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        throw urlError;
      }
      
      console.log('Generated signed URL:', urlData);
      
      // Return the document with URL
      return { ...data, url: urlData.signedUrl } as Document;
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
      // Fetch and view existing receipt
      const document = await fetchReceiptDocument(expense.receipt_document_id);
      if (document) {
        setReceiptDocument(document);
        setViewingReceipt(true);
      }
    } else {
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
