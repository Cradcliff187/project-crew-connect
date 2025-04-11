import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentUpload from '@/components/documents/DocumentUpload';

interface DocumentUploadDirectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  title?: string;
  description?: string;
  isReceiptUploadOnly?: boolean;
  showHelpText?: boolean;
  allowEntityTypeSelection?: boolean;
}

const DocumentUploadDirectSheet: React.FC<DocumentUploadDirectSheetProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  onSuccess,
  title = "Upload Document",
  description,
  isReceiptUploadOnly = false,
  showHelpText = true,
  allowEntityTypeSelection = true,
}) => {
  const handleSuccess = (doc?: Document) => {
    if (onSuccess) {
      onSuccess(doc?.document_id);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </SheetHeader>
        
        <DocumentUpload
          entityType={entityType as any}
          entityId={entityId}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
          isReceiptUpload={isReceiptUploadOnly}
          showHelpText={showHelpText}
        />
      </SheetContent>
    </Sheet>
  );
};

export default DocumentUploadDirectSheet;
