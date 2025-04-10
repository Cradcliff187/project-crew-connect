
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface DocumentUploadDirectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: EntityType;
  entityId?: string;
  onSuccess: (documentId?: string) => void;
  title?: string;
  isReceiptUploadOnly?: boolean;
}

const DocumentUploadDirectSheet: React.FC<DocumentUploadDirectSheetProps> = ({
  open,
  onOpenChange,
  entityType = 'TIME_ENTRY',
  entityId,
  onSuccess,
  title = 'Upload Document',
  isReceiptUploadOnly = false
}) => {
  const handleSuccess = (documentId?: string) => {
    if (onSuccess) {
      onSuccess(documentId);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Only render content when open to avoid unnecessary calculations
  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        
        <div className="py-2">
          <EnhancedDocumentUpload
            entityType={entityType}
            entityId={entityId}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            isReceiptUpload={isReceiptUploadOnly}
            allowEntityTypeSelection={!entityId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocumentUploadDirectSheet;
