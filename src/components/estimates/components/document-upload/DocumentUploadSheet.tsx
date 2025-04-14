import React, { useCallback } from 'react';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface DocumentUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tempId: string;
  entityType: 'ESTIMATE' | 'ESTIMATE_ITEM';
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
  title,
}) => {
  // If the sheet is not open, don't render the contents to prevent unnecessary calculations
  if (!isOpen) return null;

  // Memoize the success handler to prevent unnecessary re-renders
  const handleSuccess = useCallback(
    (documentId?: string) => {
      if (documentId) {
        onSuccess(documentId);
      } else {
        onClose();
      }
    },
    [onSuccess, onClose]
  );

  // Create a stable memoized cancel handler
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <SheetContent className="w-[90vw] sm:max-w-[600px] p-0" onClick={e => e.stopPropagation()}>
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>

      {tempId && (
        <EnhancedDocumentUpload
          entityType={entityType}
          entityId={itemId || tempId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          preventFormPropagation={true}
        />
      )}
    </SheetContent>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(DocumentUploadSheet);
