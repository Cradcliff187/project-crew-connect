
import { useState } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import { fetchDocumentWithUrl } from '@/components/documents/services/DocumentFetcher';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  // State for receipt upload dialog
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<WorkOrderMaterial | null>(null);
  
  // State for viewing receipt
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const [receiptDocument, setReceiptDocument] = useState<Document | null>(null);
  
  // Handle receipt button click
  const handleReceiptClick = async (material: WorkOrderMaterial) => {
    console.log("Receipt button clicked for material:", material);
    setSelectedMaterial(material);
    
    // Check if material has a receipt
    if (material.receipt_document_id) {
      // Fetch and view existing receipt
      const document = await fetchDocumentWithUrl(material.receipt_document_id, {
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
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  // Close receipt viewer
  const handleCloseReceiptViewer = () => {
    setViewingReceipt(false);
    setReceiptDocument(null);
  };
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  };
}
