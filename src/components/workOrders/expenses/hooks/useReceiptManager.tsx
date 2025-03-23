
import { useState, useCallback } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<WorkOrderExpense | null>(null);
  
  // Use the centralized document viewer hook
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    setIsViewerOpen,
    currentDocument, 
    isLoading 
  } = useDocumentViewer({
    imageOptions: {
      width: 1200,
      height: 1200,
      quality: 90
    },
    onClose: () => {
      console.log('Document viewer closed via hook callback');
    }
  });
  
  const handleReceiptClick = async (expense: WorkOrderExpense) => {
    if (expense.receipt_document_id) {
      console.log('Viewing existing receipt for expense:', expense.id);
      setSelectedExpense(expense);
      await viewDocument(expense.receipt_document_id);
    } else {
      console.log('Setting up receipt upload for expense:', expense.id);
      // Upload new receipt
      setSelectedExpense(expense);
      setShowReceiptUpload(true);
    }
  };
  
  const handleCloseReceiptViewer = useCallback(() => {
    closeViewer();
    // Add delay before clearing selected expense
    setTimeout(() => {
      setSelectedExpense(null);
    }, 100);
  }, [closeViewer]);
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedExpense,
    setSelectedExpense,
    viewingReceipt: isViewerOpen,
    setViewingReceipt: (isOpen: boolean) => {
      if (!isOpen) {
        handleCloseReceiptViewer();
      } else {
        setIsViewerOpen(true);
      }
    },
    receiptDocument: currentDocument,
    isLoading,
    handleReceiptClick,
    handleCloseReceiptViewer
  };
}
