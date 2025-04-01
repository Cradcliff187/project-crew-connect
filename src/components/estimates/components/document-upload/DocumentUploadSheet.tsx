
import React from 'react';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface DocumentUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tempId: string;
  entityType: "ESTIMATE" | "ESTIMATE_ITEM";
  itemId?: string;
  onSuccess: (documentId?: string) => void;
  title: string;
}

const DocumentUploadSheet: React.FC<DocumentUploadSheetProps> = ({
  isOpen,
  onClose,
  tempId,
  entityType,
  itemId,
  onSuccess,
  title
}) => {
  if (!isOpen) return null;

  return (
    <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      
      {tempId && (
        <EnhancedDocumentUpload 
          entityType={entityType}
          entityId={itemId || tempId}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      )}
    </SheetContent>
  );
};

export default DocumentUploadSheet;
