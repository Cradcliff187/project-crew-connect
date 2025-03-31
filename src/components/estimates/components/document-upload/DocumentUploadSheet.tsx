
import React from 'react';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { FormFallbackProvider } from '@/hooks/useFormContext';

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
  // Create a stable ID that won't change on re-renders
  const uniqueEntityId = itemId 
    ? `${tempId}-item-${itemId}` 
    : tempId;
  
  // Create a stable instance ID without Date.now()
  const instanceId = `upload-${entityType}-${uniqueEntityId}`;
  
  console.log('DocumentUploadSheet rendering:', {
    instanceId,
    entityType,
    uniqueEntityId,
    isOpen,
    itemId
  });

  const handleSuccess = (documentId?: string) => {
    console.log(`Document upload success for ${instanceId}, ID:`, documentId);
    // Use setTimeout to ensure the sheet has time to close properly before calling onSuccess
    setTimeout(() => {
      onSuccess(documentId);
    }, 100); // Extended delay to ensure proper cleanup
  };

  // Wrap the document upload component in a FormFallbackProvider
  // This will prevent form context interference with parent forms
  return (
    <SheetContent 
      className="w-[90vw] sm:max-w-[600px] p-0"
      onOpenAutoFocus={(e) => {
        // Prevent auto-focus to avoid interference with form elements
        e.preventDefault();
      }}
      onPointerDownOutside={(e) => {
        // Prevent accidental clicks outside the sheet from closing it during file upload
        if (e.target && (e.target as HTMLElement).closest('.uploading')) {
          e.preventDefault();
        }
      }}
    >
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      
      {tempId && (
        <FormFallbackProvider>
          <EnhancedDocumentUpload 
            entityType={entityType}
            entityId={uniqueEntityId}
            onSuccess={handleSuccess}
            onCancel={onClose}
            instanceId={instanceId}
          />
        </FormFallbackProvider>
      )}
    </SheetContent>
  );
};

export default DocumentUploadSheet;
