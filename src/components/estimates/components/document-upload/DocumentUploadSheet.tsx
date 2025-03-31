
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
  // Create a truly stable and unique ID
  const stableSheetId = React.useMemo(() => {
    const baseId = entityType === 'ESTIMATE_ITEM' 
      ? `estimate-item-${itemId}-${tempId.substring(0, 8)}` 
      : `estimate-${tempId.substring(0, 8)}`;
    return `${baseId}-${Math.random().toString(36).substring(2, 8)}`;
  }, [entityType, itemId, tempId]);

  // Generate a consistent entity ID that doesn't change on re-renders
  const entityId = React.useMemo(() => {
    if (entityType === 'ESTIMATE_ITEM') {
      // For items, include both the estimate ID and item ID
      return `${tempId}-item-${itemId}`;
    }
    // For the main estimate, just use the tempId
    return tempId;
  }, [entityType, tempId, itemId]);

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
        instanceId={stableSheetId}
      />
    </SheetContent>
  );
};

export default React.memo(DocumentUploadSheet);
