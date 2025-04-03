
import { useState, useCallback } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<WorkOrderMaterial | null>(null);
  
  // Use the centralized document viewer hook
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    setIsViewerOpen,
    currentDocument, 
    loading: isLoading 
  } = useDocumentViewer({
    onClose: () => {
      console.log('Document viewer closed via hook callback');
    }
  });
  
  // Handle receipt button click
  const handleReceiptClick = async (material: WorkOrderMaterial) => {
    console.log("Receipt button clicked for material:", material);
    setSelectedMaterial(material);
    
    // Check if material has a receipt
    if (material.receipt_document_id) {
      // View existing receipt using the document viewer hook
      await viewDocument(material.receipt_document_id);
    } else {
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  const handleCloseReceiptViewer = useCallback(() => {
    closeViewer();
    // Add delay before clearing selected material
    setTimeout(() => {
      setSelectedMaterial(null);
    }, 100);
  }, [closeViewer]);
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
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
