
import { useState } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
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
    currentDocument, 
    isLoading 
  } = useDocumentViewer({
    imageOptions: {
      width: 1200,
      height: 1200,
      quality: 90
    }
  });
  
  // Handle receipt button click
  const handleReceiptClick = async (material: WorkOrderMaterial) => {
    console.log("Receipt button clicked for material:", material);
    setSelectedMaterial(material);
    
    // Check if material has a receipt
    if (material.receipt_document_id) {
      // View existing receipt using the document viewer hook
      viewDocument(material.receipt_document_id);
    } else {
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
    viewingReceipt: isViewerOpen,
    setViewingReceipt: (isOpen: boolean) => !isOpen && closeViewer(),
    receiptDocument: currentDocument,
    isLoading,
    handleReceiptClick,
    handleCloseReceiptViewer: closeViewer
  };
}
