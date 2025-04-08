
import { useState } from 'react';
import { ReceiptMetadata } from '@/types/timeTracking';
import { EXPENSE_TYPES } from '@/types/expenseTypes';

interface UseReceiptUploadOptions {
  initialHasReceipts?: boolean;
  initialMetadata?: Partial<ReceiptMetadata>;
  onMetadataChange?: (metadata: ReceiptMetadata) => void;
}

/**
 * A standardized hook for managing receipt uploads across different time tracking interfaces
 */
export function useReceiptUpload(options: UseReceiptUploadOptions = {}) {
  const {
    initialHasReceipts = false,
    initialMetadata = {},
    onMetadataChange
  } = options;
  
  // Default metadata that satisfies the ReceiptMetadata interface
  const defaultMetadata: ReceiptMetadata = {
    category: 'receipt',
    expenseType: null,
    tags: ['time-entry'],
    vendorType: 'vendor'
  };
  
  const [hasReceipts, setHasReceipts] = useState(initialHasReceipts);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<ReceiptMetadata>({
    ...defaultMetadata,
    ...initialMetadata
  });
  
  // Handle selection of files
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Automatically enable receipts if files are selected
    if (files.length > 0 && !hasReceipts) {
      setHasReceipts(true);
    }
  };
  
  // Handle removal of a file
  const handleFileClear = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    // Reset hasReceipts if no files left
    if (updatedFiles.length === 0) {
      setHasReceipts(false);
    }
  };
  
  // Update metadata
  const updateMetadata = (data: Partial<ReceiptMetadata>) => {
    const updatedMetadata = {
      ...receiptMetadata,
      ...data
    };
    setReceiptMetadata(updatedMetadata);
    
    if (onMetadataChange) {
      onMetadataChange(updatedMetadata);
    }
  };
  
  // Validate receipt data before submission
  const validateReceiptData = () => {
    // If hasReceipts is true but no files were selected
    if (hasReceipts && selectedFiles.length === 0) {
      return {
        valid: false,
        error: 'You indicated you have receipts but none were uploaded. Please upload at least one receipt or turn off the receipt option.'
      };
    }
    
    // If we have receipts but no expense type
    if (hasReceipts && selectedFiles.length > 0 && !receiptMetadata.expenseType) {
      return {
        valid: false,
        error: 'Please select an expense type for your receipt.'
      };
    }
    
    // If we have receipts but no vendor selected (unless it's 'other')
    if (hasReceipts && selectedFiles.length > 0 && 
        receiptMetadata.vendorType !== 'other' && 
        !receiptMetadata.vendorId) {
      return {
        valid: false,
        error: `Please select a ${receiptMetadata.vendorType} for this receipt.`
      };
    }
    
    return { valid: true, error: null };
  };
  
  return {
    hasReceipts,
    setHasReceipts,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateMetadata,
    validateReceiptData
  };
}
