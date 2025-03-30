
import { useState, useCallback } from 'react';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { toast } from '@/hooks/use-toast';

interface ReceiptEntity {
  receipt_document_id?: string | null;
  document_id?: string | null; // Add explicit support for both field names
  [key: string]: any;
}

interface UseReceiptManagerOptions {
  entityType: string;
  onCloseCallback?: () => void;
}

export function useReceiptManager<T extends ReceiptEntity>(options?: UseReceiptManagerOptions) {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<T | null>(null);
  
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
      if (options?.onCloseCallback) {
        options.onCloseCallback();
      }
    }
  });
  
  // Handle receipt button click
  const handleReceiptClick = async (entity: T) => {
    console.log(`Receipt button clicked for ${options?.entityType || 'entity'}:`, entity);
    setSelectedEntity(entity);
    
    // Check if entity has a receipt - look for either field name that could contain document ID
    const documentId = entity.receipt_document_id || entity.document_id;
    
    if (documentId) {
      // View existing receipt using the document viewer hook
      try {
        await viewDocument(documentId);
      } catch (error) {
        console.error('Error viewing receipt:', error);
        toast({
          title: 'Error',
          description: 'Could not load the receipt. The document may no longer exist.',
          variant: 'destructive'
        });
      }
    } else {
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  const handleCloseReceiptViewer = useCallback(() => {
    closeViewer();
    // Add delay before clearing selected entity
    setTimeout(() => {
      setSelectedEntity(null);
    }, 100);
  }, [closeViewer]);
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedEntity,
    setSelectedEntity,
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
