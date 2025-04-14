import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import StandardizedDocumentUpload from './StandardizedDocumentUpload';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { viewerAnimations } from '@/lib/animations';
import { EntityType } from '@/types/common';

interface StandardizedDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  entityId: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    vendorName?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    category?: string;
    tags?: string[];
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
    expenseType?: string;
  };
  preventFormPropagation?: boolean;
  allowEntityTypeSelection?: boolean;
  onEntityTypeChange?: (entityType: EntityType) => void;
}

const StandardizedDocumentUploadDialog: React.FC<StandardizedDocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  onSuccess,
  onCancel,
  title,
  description,
  isReceiptUpload = false,
  prefillData,
  preventFormPropagation = false,
  allowEntityTypeSelection = false,
  onEntityTypeChange,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Handle document upload success
  const handleSuccess = (documentId?: string) => {
    if (onSuccess) {
      onSuccess(documentId);
    }
    onOpenChange(false);
  };

  // Handle cancel button
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  // Generate default title and description based on entity type
  const getDefaultTitle = () => {
    if (isReceiptUpload) return 'Upload Receipt';

    switch (entityType) {
      case 'VENDOR':
        return 'Upload Vendor Document';
      case 'SUBCONTRACTOR':
        return 'Upload Subcontractor Document';
      case 'PROJECT':
        return 'Upload Project Document';
      case 'ESTIMATE':
        return 'Upload Estimate Document';
      case 'WORK_ORDER':
        return 'Upload Work Order Document';
      case 'TIME_ENTRY':
        return 'Upload Time Entry Document';
      case 'EMPLOYEE':
        return 'Upload Employee Document';
      default:
        return 'Upload Document';
    }
  };

  const getDefaultDescription = () => {
    if (isReceiptUpload) {
      return 'Upload receipts for expenses related to this work order or project.';
    }

    switch (entityType) {
      case 'VENDOR':
        return 'Upload documents related to this vendor such as certifications or contracts.';
      case 'SUBCONTRACTOR':
        return 'Upload documents related to this subcontractor such as insurance or certifications.';
      case 'PROJECT':
        return 'Upload documents for this project such as photos, contracts or specifications.';
      case 'ESTIMATE':
        return 'Upload documents for this estimate such as quotes, proposals or specifications.';
      case 'WORK_ORDER':
        return 'Upload documents for this work order such as receipts, photos or contracts.';
      case 'TIME_ENTRY':
        return 'Upload receipts or timesheets for this time entry.';
      case 'EMPLOYEE':
        return 'Upload documents for this employee such as certifications or timesheets.';
      default:
        return 'Upload and categorize your document for easier access later.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isMobile ? 'sm:max-w-[100%] w-full p-4' : 'sm:max-w-[600px] p-6',
          'max-h-[90vh] overflow-auto',
          viewerAnimations.content
        )}
      >
        <DialogHeader>
          <DialogTitle>{title || getDefaultTitle()}</DialogTitle>
          <DialogDescription>{description || getDefaultDescription()}</DialogDescription>
        </DialogHeader>

        <StandardizedDocumentUpload
          entityType={entityType}
          entityId={entityId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isReceiptUpload={isReceiptUpload}
          prefillData={prefillData}
          preventFormPropagation={preventFormPropagation}
          allowEntityTypeSelection={allowEntityTypeSelection}
          onEntityTypeChange={onEntityTypeChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StandardizedDocumentUploadDialog;
