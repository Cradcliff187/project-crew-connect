
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from './EnhancedDocumentUpload';
import { EntityType } from './schemas/documentSchema';

interface EnhancedDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    category?: string;
    tags?: string[];
  };
  preventFormPropagation?: boolean;
  allowEntityTypeSelection?: boolean;
}

const EnhancedDocumentUploadDialog: React.FC<EnhancedDocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  onSuccess,
  onCancel,
  title = 'Upload Document',
  description = 'Upload and categorize your document',
  isReceiptUpload = false,
  prefillData,
  preventFormPropagation = false,
  allowEntityTypeSelection = false
}) => {
  const handleSuccess = (documentId?: string) => {
    if (onSuccess) {
      onSuccess(documentId);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <EnhancedDocumentUpload 
          entityType={entityType}
          entityId={entityId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isReceiptUpload={isReceiptUpload}
          prefillData={prefillData}
          preventFormPropagation={preventFormPropagation}
          allowEntityTypeSelection={allowEntityTypeSelection}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedDocumentUploadDialog;
