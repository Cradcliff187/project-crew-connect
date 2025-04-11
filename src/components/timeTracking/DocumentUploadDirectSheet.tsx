
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface DocumentUploadDirectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: string;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  isReceiptUploadOnly?: boolean;
  showHelpText?: boolean;
  allowEntityTypeSelection?: boolean;
}

const DocumentUploadDirectSheet: React.FC<DocumentUploadDirectSheetProps> = ({
  open,
  onOpenChange,
  entityType = 'WORK_ORDER',
  entityId,
  onSuccess,
  onCancel,
  title = 'Upload Document',
  description = 'Upload documents for this entity',
  isReceiptUploadOnly = false,
  showHelpText = true,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:max-w-[600px] mx-auto">
        <SheetHeader className="relative pr-8">
          <Button
            variant="ghost"
            className="absolute right-0 top-0 rounded-full p-2 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <SheetTitle>{title}</SheetTitle>
          {showHelpText && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        
        <div className="pt-4 h-full overflow-auto">
          <EnhancedDocumentUpload
            entityType={entityType}
            entityId={entityId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isReceiptUpload={isReceiptUploadOnly}
            preventFormPropagation={true}
            allowEntityTypeSelection={allowEntityTypeSelection}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocumentUploadDirectSheet;
