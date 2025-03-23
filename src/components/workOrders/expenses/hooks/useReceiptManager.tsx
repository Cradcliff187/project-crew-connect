
import { useState } from 'react';
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
    currentDocument, 
    isLoading 
  } = useDocumentViewer({
    imageOptions: {
      width: 1200,
      height: 1200,
      quality: 90
    }
  });
  
  const handleReceiptClick = async (expense: WorkOrderExpense) => {
    if (expense.receipt_document_id) {
      console.log('Viewing existing receipt for expense:', expense.id);
      setSelectedExpense(expense);
      viewDocument(expense.receipt_document_id);
    } else {
      console.log('Setting up receipt upload for expense:', expense.id);
      // Upload new receipt
      setSelectedExpense(expense);
      setShowReceiptUpload(true);
    }
  };
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedExpense,
    setSelectedExpense,
    viewingReceipt: isViewerOpen,
    setViewingReceipt: (isOpen: boolean) => !isOpen && closeViewer(),
    receiptDocument: currentDocument,
    isLoading,
    handleReceiptClick,
    handleCloseReceiptViewer: closeViewer
  };
}
