
import React from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
  title
}) => {
  // Create a stable and unique instance ID for this document upload
  const instanceId = entityType === 'ESTIMATE_ITEM' 
    ? `estimate-item-${itemId}-${tempId.substring(0, 8)}` 
    : `estimate-${tempId.substring(0, 8)}`;

  // Generate an appropriate entity ID
  const entityId = entityType === 'ESTIMATE_ITEM'
    ? `${tempId}-item-${itemId}`
    : tempId;

  if (!isOpen) {
    return null;
  }

  return (
    <SheetContent 
      className="w-[90vw] sm:max-w-[600px] p-0" 
      onInteractOutside={onClose}
      onEscapeKeyDown={onClose}
    >
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>
          Upload files to attach to {entityType === 'ESTIMATE_ITEM' ? 'this line item' : 'this estimate'}.
        </SheetDescription>
      </SheetHeader>
      
      <EnhancedDocumentUpload 
        entityType={entityType}
        entityId={entityId}
        onSuccess={onSuccess}
        onCancel={onClose}
        instanceId={instanceId}
      />
    </SheetContent>
  );
};

export default DocumentUploadSheet;
