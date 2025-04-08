
import { useState } from 'react';
import { ReceiptMetadata } from '@/types/timeTracking';

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
    initialMetadata = {
      category: 'receipt',
      expenseType: null,
      tags: ['time-entry'],
      vendorType: 'vendor'
    },
    onMetadataChange
  } = options;
  
  const [hasReceipts, setHasReceipts] = useState(initialHasReceipts);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<ReceiptMetadata>({
    category: 'receipt',
    expenseType: initialMetadata.expenseType || null,
    tags: initialMetadata.tags || ['time-entry'],
    vendorId: initialMetadata.vendorId,
    vendorType: initialMetadata.vendorType || 'vendor',
    amount: initialMetadata.amount,
    expenseDate: initialMetadata.expenseDate || new Date(),
    notes: initialMetadata.notes,
    isExpense: initialMetadata.isExpense !== undefined ? initialMetadata.isExpense : true
  });
  
  // Toggle receipts on/off
  const toggleHasReceipts = (value: boolean) => {
    setHasReceipts(value);
    if (!value) {
      setSelectedFiles([]);
    }
  };
  
  // Update files
  const updateFiles = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    
    // Auto-enable receipts when files are selected
    if (files.length > 0 && !hasReceipts) {
      setHasReceipts(true);
    }
  };
  
  // Handle file removal
  const handleFileClear = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    
    // Auto-disable receipts when no files remain
    if (updatedFiles.length === 0) {
      setHasReceipts(false);
    }
  };
  
  // Update metadata
  const updateMetadata = (update: Partial<ReceiptMetadata>) => {
    setReceiptMetadata(prev => {
      const updated = { ...prev, ...update };
      if (onMetadataChange) {
        onMetadataChange(updated);
      }
      return updated;
    });
  };
  
  // Reset everything
  const reset = () => {
    setHasReceipts(initialHasReceipts);
    setSelectedFiles([]);
    setReceiptMetadata({
      category: 'receipt',
      expenseType: initialMetadata.expenseType || null,
      tags: initialMetadata.tags || ['time-entry'],
      vendorId: initialMetadata.vendorId,
      vendorType: initialMetadata.vendorType || 'vendor',
      amount: initialMetadata.amount,
      expenseDate: initialMetadata.expenseDate || new Date(),
      notes: initialMetadata.notes,
      isExpense: initialMetadata.isExpense !== undefined ? initialMetadata.isExpense : true
    });
  };
  
  // Validate receipt data
  const validateReceiptData = (): { valid: boolean; error?: string } => {
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
        error: `Please select a ${receiptMetadata.vendorType || 'vendor'} for this receipt.`
      };
    }
    
    return { valid: true };
  };
  
  return {
    hasReceipts,
    setHasReceipts: toggleHasReceipts,
    selectedFiles,
    setSelectedFiles: updateFiles,
    receiptMetadata,
    updateMetadata,
    handleFilesSelected,
    handleFileClear,
    validateReceiptData,
    reset
  };
}
