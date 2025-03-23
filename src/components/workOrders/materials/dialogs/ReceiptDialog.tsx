
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import MaterialReceiptUpload from '../components/MaterialReceiptUpload';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';

interface ReceiptUploadDialogProps {
  open: boolean;
  material: WorkOrderMaterial | null;
  workOrderId: string;
  vendorName: string;
  onSuccess: (materialId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptUploadDialog = ({
  open,
  material,
  workOrderId,
  vendorName,
  onSuccess,
  onCancel,
}: ReceiptUploadDialogProps) => {
  if (!material) return null;

  const handleReceiptSuccess = (documentId?: string) => {
    if (documentId) {
      onSuccess(material.id, documentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
          <DialogDescription>
            Upload a receipt for this material
          </DialogDescription>
        </DialogHeader>
        <MaterialReceiptUpload
          workOrderId={workOrderId}
          material={material}
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
          <DialogDescription>
            Preview of the receipt document
          </DialogDescription>
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
