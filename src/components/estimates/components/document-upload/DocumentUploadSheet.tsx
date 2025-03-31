
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
  
  // Generate a unique ID for this document upload session
  const uniqueEntityId = itemId ? `${tempId}-item-${itemId}` : tempId;
  
  console.log('DocumentUploadSheet rendering with:', {
    entityType,
    uniqueEntityId,
    isOpen
  });

  const handleSuccess = (documentId?: string) => {
    console.log('Document upload success, ID:', documentId);
    // Use setTimeout to ensure the sheet has time to close properly before calling onSuccess
    setTimeout(() => {
      onSuccess(documentId);
    }, 50);
  };

  return (
    <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      
      {tempId && (
        <EnhancedDocumentUpload 
          entityType={entityType}
          entityId={uniqueEntityId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      )}
    </SheetContent>
  );
};

export default DocumentUploadSheet;
