
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
  // Using sanitized values to ensure they're valid for DOM IDs
  const stableSheetId = useMemo(() => {
    const sanitizedTempId = tempId.replace(/[^a-zA-Z0-9-]/g, '-');
    const sanitizedItemId = itemId ? itemId.replace(/[^a-zA-Z0-9-]/g, '-') : 'unknown';
    
    return entityType === 'ESTIMATE_ITEM' 
      ? `estimate-item-${sanitizedItemId}-${sanitizedTempId}` 
      : `estimate-${sanitizedTempId}`;
  }, [entityType, itemId, tempId]);

  // Generate a consistent entity ID
  const entityId = useMemo(() => {
    // Ensure we have sanitized, valid IDs
    const sanitizedTempId = tempId.replace(/[^a-zA-Z0-9-]/g, '-');
    
    if (entityType === 'ESTIMATE_ITEM' && itemId) {
      const sanitizedItemId = itemId.replace(/[^a-zA-Z0-9-]/g, '-');
      return `${sanitizedTempId}-item-${sanitizedItemId}`;
    }
    return sanitizedTempId;
  }, [entityType, tempId, itemId]);
  
  // Unique aria ID for accessibility
  const sheetDescriptionId = `sheet-desc-${stableSheetId}`;

  // Don't render anything if the sheet is closed
  if (!isOpen) {
    return null;
  }

  return (
    <SheetContent 
      className="w-[90vw] sm:max-w-[600px] p-0" 
      onInteractOutside={onClose}
      onEscapeKeyDown={onClose}
      aria-describedby={sheetDescriptionId}
    >
      <SheetHeader className="p-6 pb-2">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription id={sheetDescriptionId}>
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
