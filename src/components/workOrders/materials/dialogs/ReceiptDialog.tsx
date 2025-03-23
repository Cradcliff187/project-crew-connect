
import { WorkOrderMaterial } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import MaterialReceiptUpload from '../components/MaterialReceiptUpload';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import BaseReceiptUploadDialog from '@/components/documents/ReceiptUploadDialog';

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
      description="Upload a receipt for this material"
    >
      <MaterialReceiptUpload
        workOrderId={workOrderId}
        material={material}
        vendorName={vendorName}
        onSuccess={handleReceiptSuccess}
        onCancel={onCancel}
      />
    </BaseReceiptUploadDialog>
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
  if (!receiptDocument) return null;

  return (
    <DocumentViewerDialog
      open={open}
      onOpenChange={onOpenChange}
      document={receiptDocument}
      title={`Receipt: ${receiptDocument.file_name}`}
      description={`${receiptDocument.file_type || 'Document'} preview`}
    />
  );
};
