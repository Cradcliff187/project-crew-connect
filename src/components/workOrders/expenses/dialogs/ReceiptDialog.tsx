
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import ExpenseReceiptUpload from '../components/ExpenseReceiptUpload';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';

interface ReceiptUploadDialogProps {
  open: boolean;
  expense: WorkOrderExpense | null;
  workOrderId: string;
  vendorName: string;
  onSuccess: (expenseId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptUploadDialog = ({
  open,
  expense,
  workOrderId,
  vendorName,
  onSuccess,
  onCancel,
}: ReceiptUploadDialogProps) => {
  if (!expense) return null;

  const handleReceiptSuccess = (documentId?: string) => {
    if (documentId) {
      onSuccess(expense.id, documentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        <ExpenseReceiptUpload
          workOrderId={workOrderId}
          expense={expense}
          vendorName={vendorName}
          onSuccess={handleReceiptSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptDocument: Document | null;
}

export const ReceiptViewerDialog = ({
  open,
  onOpenChange,
  receiptDocument,
}: ReceiptViewerDialogProps) => {
  const [error, setError] = useState(false);

  if (!receiptDocument) return null;

  // Check file type to determine display method
  const isPDF = receiptDocument.file_type?.includes('pdf');
  const isImage = receiptDocument.file_type?.includes('image');

  const handleImageError = () => {
    setError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Receipt: {receiptDocument.file_name}</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          {error ? (
            <div className="text-center p-4">
              <p className="text-destructive mb-2">Error loading receipt</p>
              <a
                href={receiptDocument.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Click here to open the receipt in a new tab
              </a>
            </div>
          ) : isPDF ? (
            <iframe
              src={receiptDocument.url}
              className="w-full h-[60vh]"
              title="Receipt PDF"
            />
          ) : isImage ? (
            <AspectRatio ratio={4 / 5} className="flex items-center justify-center">
              <img
                src={receiptDocument.url}
                alt="Receipt"
                className="max-h-[60vh] object-contain"
                onError={handleImageError}
              />
            </AspectRatio>
          ) : (
            <div className="text-center p-4">
              <p className="mb-2">This file type cannot be previewed</p>
              <a
                href={receiptDocument.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Click here to download the file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
