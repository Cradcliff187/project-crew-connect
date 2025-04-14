import { WorkOrderMaterial } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import MaterialReceiptUpload from '../components/MaterialReceiptUpload';
import {
  ReceiptUploadDialog as SharedReceiptUploadDialog,
  ReceiptViewerDialog as SharedReceiptViewerDialog,
} from '../../common/ReceiptDialogManager';

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

  return (
    <SharedReceiptUploadDialog
      open={open}
      workOrderId={workOrderId}
      vendorName={vendorName}
      itemName="material"
      itemId={material.id}
      onSuccess={onSuccess}
      onCancel={onCancel}
    >
      <MaterialReceiptUpload
        workOrderId={workOrderId}
        material={material}
        vendorName={vendorName}
        onSuccess={documentId => documentId && onSuccess(material.id, documentId)}
        onCancel={onCancel}
      />
    </SharedReceiptUploadDialog>
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
  return (
    <SharedReceiptViewerDialog
      open={open}
      onOpenChange={onOpenChange}
      receiptDocument={receiptDocument}
    />
  );
};
