
import React, { useMemo } from 'react';
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
  // Create deterministic IDs that won't change between renders
  const stableSheetId = useMemo(() => {
    return entityType === 'ESTIMATE_ITEM' 
      ? `estimate-item-${itemId || 'unknown'}-${tempId}` 
      : `estimate-${tempId}`;
  }, [entityType, itemId, tempId]);

  // Generate a consistent entity ID
  const entityId = useMemo(() => {
    if (entityType === 'ESTIMATE_ITEM' && itemId) {
      return `${tempId}-item-${itemId}`;
    }
    return tempId;
  }, [entityType, tempId, itemId]);

  // Don't render anything if the sheet is closed
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
