import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from './EnhancedDocumentUpload';
import { EntityType } from './schemas/documentSchema';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  title?: string;
  description?: string;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  onSuccess,
  title = 'Upload Document',
  description = 'Upload a document and associate it with the appropriate entity.',
}) => {
  const handleSuccess = (documentId?: string) => {
    if (onSuccess) {
      onSuccess(documentId);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <EnhancedDocumentUpload
          entityType={entityType}
          entityId={entityId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
