import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Document } from '@/components/documents/schemas/documentSchema';
import { Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentViewer from '../details/DocumentsList/DocumentViewer';

interface ReceiptUploadDialogProps {
  open: boolean;
  workOrderId: string;
  vendorName: string;
  itemName: string;
  itemId: string;
  onSuccess: (itemId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
  children: React.ReactNode;
}

export const ReceiptUploadDialog: React.FC<ReceiptUploadDialogProps> = ({
  open,
  workOrderId,
  vendorName,
  itemName,
  itemId,
  onSuccess,
  onCancel,
  children,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={openState => {
        if (!openState) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center text-[#0485ea]">
              <Receipt className="h-5 w-5 mr-2" />
              Upload Receipt for {itemName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a receipt or invoice for this {itemName.toLowerCase()} from{' '}
            {vendorName || 'the vendor'}.
          </p>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptDocument: Document | null;
}

export const ReceiptViewerDialog: React.FC<ReceiptViewerDialogProps> = ({
  open,
  onOpenChange,
  receiptDocument,
}) => {
  if (!receiptDocument) return null;

  // Convert Document type to WorkOrderDocument type for the viewer
  const documentForViewer = {
    ...receiptDocument,
    document_id: receiptDocument.document_id,
    file_name: receiptDocument.file_name,
    file_type: receiptDocument.file_type,
    file_size: receiptDocument.file_size,
    url: receiptDocument.url,
    entity_id: receiptDocument.entity_id,
    entity_type: receiptDocument.entity_type,
    created_at: receiptDocument.created_at,
    updated_at: receiptDocument.updated_at,
    is_receipt: true,
  };

  return (
    <DocumentViewer document={documentForViewer as any} open={open} onOpenChange={onOpenChange} />
  );
};
