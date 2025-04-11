
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
      const documentId = await uploadReceiptFile(file, timeEntryId, {
        vendorId: metadata?.vendorId,
        amount: metadata?.amount,
        expenseType: metadata?.expenseType || 'OTHER',
        notes: metadata?.notes
      });
      
      toast({
        title: 'Receipt uploaded',
        description: 'The receipt has been successfully uploaded.',
      });
      
      return documentId;
    } catch (error: any) {
      console.error('Receipt upload error:', error);
      
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload receipt.',
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
