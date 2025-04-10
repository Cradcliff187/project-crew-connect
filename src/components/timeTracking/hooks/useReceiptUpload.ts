
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { ReceiptMetadata } from '@/types/timeTracking';

interface UseReceiptUploadOptions {
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  entityType?: EntityType;
  entityId?: string;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    notes?: string;
    expenseType?: string;
  };
}

export function useReceiptUpload({
  onSuccess,
  onCancel,
  entityType,
  entityId,
  prefillData
}: UseReceiptUploadOptions = {}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  
  // Default receipt metadata
  const [metadata, setMetadata] = useState<ReceiptMetadata>({
    category: 'receipt',
    expenseType: prefillData?.expenseType || null,
    tags: ['time-entry'],
    vendorId: prefillData?.vendorId,
    amount: prefillData?.amount
  });
  
  const promptForReceipt = () => {
    setShowPrompt(true);
  };
  
  const handleConfirmReceipt = () => {
    setShowPrompt(false);
    setShowUpload(true);
  };
  
  const handleSkipReceipt = () => {
    setShowPrompt(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleUploadSuccess = (documentId?: string) => {
    setShowUpload(false);
    toast({
      title: "Receipt uploaded successfully",
      description: "Your receipt has been attached to this time entry"
    });
    
    if (onSuccess) {
      onSuccess(documentId);
    }
  };
  
  const updateMetadata = (newData: Partial<ReceiptMetadata>) => {
    setMetadata(prev => ({
      ...prev,
      ...newData
    }));
  };
  
  return {
    showPrompt,
    setShowPrompt,
    showUpload,
    setShowUpload,
    metadata,
    updateMetadata,
    promptForReceipt,
    handleConfirmReceipt,
    handleSkipReceipt,
    handleUploadSuccess
  };
}
