
import { useState } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import { fetchDocumentWithUrl } from '@/components/documents/services/DocumentFetcher';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<WorkOrderExpense | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const [receiptDocument, setReceiptDocument] = useState<Document | null>(null);
  
  const handleReceiptClick = async (expense: WorkOrderExpense) => {
    if (expense.receipt_document_id) {
      console.log('Viewing existing receipt for expense:', expense.id);
      // Fetch and view existing receipt
      const document = await fetchDocumentWithUrl(expense.receipt_document_id, {
        imageOptions: {
          width: 1200,
          height: 1200,
          quality: 90
        }
      });
      
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
