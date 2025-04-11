
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { uploadReceiptFile } from '@/components/timeTracking/utils/receiptUtils';

interface ReceiptMetadata {
  vendorId?: string;
  amount?: number;
  expenseType?: string;
  notes?: string;
}

export function useReceiptUpload() {
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadReceipt = async (
    file: File,
    timeEntryId: string,
    metadata?: ReceiptMetadata
  ) => {
    if (!file || !timeEntryId) {
      toast({
        title: 'Upload failed',
        description: 'Missing required information for upload.',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsUploading(true);
    
    try {
      // Ensure expense type is set
      const expenseType = metadata?.expenseType || 'MATERIALS';
      
      const documentId = await uploadReceiptFile(file, timeEntryId, {
        vendorId: metadata?.vendorId,
        amount: metadata?.amount,
        expenseType: expenseType,
        notes: metadata?.notes
      });
      
      if (!documentId) {
        throw new Error('Failed to get document ID after upload');
      }
      
      toast({
        title: 'Receipt uploaded',
        description: 'The receipt has been successfully uploaded.',
      });
      
      return documentId;
    } catch (error: any) {
      console.error('Receipt upload error:', error);
      
      // Provide more specific error message based on the error
      let errorMessage = 'Failed to upload receipt.';
      
      if (error.message?.includes('trigger functions')) {
        errorMessage = 'System error: Please contact support.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Error storing file: Please try a different file format or smaller file.';
      } else if (error.message?.includes('permission')) { 
        errorMessage = 'Permission error: You may not have access to upload receipts.';
      }
      
      toast({
        title: 'Upload failed',
        description: error.message || errorMessage,
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    uploadReceipt
  };
}
