
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
    onClose: () => {
      console.log('Document viewer closed via hook callback');
    }
  });
  
  // Handle receipt button click
  const handleReceiptClick = async (expense: WorkOrderExpense) => {
    console.log("Receipt button clicked for expense:", expense);
    setSelectedExpense(expense);
    
    // Check if expense has a receipt
    if (expense.receipt_document_id) {
      // View existing receipt using the document viewer hook
      await viewDocument(expense.receipt_document_id);
    } else {
      // Show upload dialog for new receipt
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
