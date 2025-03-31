
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
  // Create a truly stable ID that won't change between renders
  const stableSheetId = useMemo(() => {
    // Create a base ID with all the relevant info but without random components
    const baseId = entityType === 'ESTIMATE_ITEM' 
      ? `estimate-item-${itemId || 'unknown'}-${tempId}` 
      : `estimate-${tempId}`;
    
    // Return a completely deterministic ID
    return baseId;
  }, [entityType, itemId, tempId]);

  // Generate a consistent entity ID that doesn't change on re-renders
  const entityId = useMemo(() => {
    if (entityType === 'ESTIMATE_ITEM' && itemId) {
      // For items, include both the estimate ID and item ID in a consistent format
      return `${tempId}-item-${itemId}`;
    }
    // For the main estimate, just use the tempId
    return tempId;
  }, [entityType, tempId, itemId]);

  if (!isOpen) {
    return null;
  }

  // Use stable IDs and a simpler architecture
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
