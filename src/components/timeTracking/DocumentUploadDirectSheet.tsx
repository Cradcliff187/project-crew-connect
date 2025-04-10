
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadDirectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: EntityType;
  entityId?: string;
  onSuccess: (documentId?: string) => void;
  title?: string;
  isReceiptUploadOnly?: boolean;
  description?: string;
  showHelpText?: boolean;
  allowEntityTypeSelection?: boolean;
}

const DocumentUploadDirectSheet: React.FC<DocumentUploadDirectSheetProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  onSuccess,
  title = 'Upload Document',
  isReceiptUploadOnly = false,
  description,
  showHelpText = true,
  allowEntityTypeSelection = false
}) => {
  const [uploading, setUploading] = useState(false);
  
  const handleSuccess = (documentId?: string) => {
    if (onSuccess) {
      onSuccess(documentId);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!uploading) {
      onOpenChange(false);
    }
  };

  // Only render content when open to avoid unnecessary calculations
  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={uploading ? undefined : onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto pb-0">
        <SheetHeader className={cn("pb-2", description ? "mb-2" : "")}>
          <SheetTitle>{title}</SheetTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </SheetHeader>
        
        {showHelpText && (
          <div className="mb-4 p-3 rounded-md bg-muted flex items-start gap-2">
            <Info className="h-5 w-5 text-[#0485ea] mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>You can upload receipts, photos, and other documents</li>
                <li>Select an entity type and ID to associate your document</li>
                <li>Add details like vendor, amount, and category for better organization</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="py-2">
          <EnhancedDocumentUpload
            entityType={entityType}
            entityId={entityId}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            isReceiptUpload={isReceiptUploadOnly}
            allowEntityTypeSelection={allowEntityTypeSelection}
          />
        </div>
        
        {/* Removed the absolute positioned button that was causing overlap */}
      </SheetContent>
    </Sheet>
  );
};

export default DocumentUploadDirectSheet;
