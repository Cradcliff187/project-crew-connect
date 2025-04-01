
import { ReactNode } from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import BaseReceiptUploadDialog from '@/components/documents/ReceiptUploadDialog';

interface ReceiptUploadProps {
  open: boolean;
  workOrderId: string;
  vendorName: string;
  itemName: string;
  itemId: string;
  onSuccess: (itemId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
  children: ReactNode;
}

export const ReceiptUploadDialog = ({
  open,
  workOrderId,
  vendorName,
  itemName,
  itemId,
  onSuccess,
  onCancel,
  children
}: ReceiptUploadProps) => {
  const handleReceiptSuccess = (documentId?: string) => {
    if (documentId) {
      onSuccess(itemId, documentId);
    } else {
      // Even if no documentId, still call onCancel to close the dialog
      onCancel();
    }
  };

  return (
    <BaseReceiptUploadDialog
      open={open}
      onOpenChange={(open) => !open && onCancel()}
      title="Upload Receipt"
      description={`Upload a receipt for this ${itemName}`}
    >
      {children}
    </BaseReceiptUploadDialog>
  );
};

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptDocument: Document | null;
  title?: string;
  description?: string;
}

export const ReceiptViewerDialog = ({
  open,
  onOpenChange,
  receiptDocument,
  title,
  description
}: ReceiptViewerDialogProps) => {
  if (!receiptDocument) return null;

  return (
    <DocumentViewerDialog
      open={open}
      onOpenChange={onOpenChange}
      document={receiptDocument}
      title={title || `Receipt for ${receiptDocument.file_name}`}
      description={description}
    />
  );
};
