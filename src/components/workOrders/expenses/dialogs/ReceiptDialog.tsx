
import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import ExpenseReceiptUpload from '../components/ExpenseReceiptUpload';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import BaseReceiptUploadDialog from '@/components/documents/ReceiptUploadDialog';

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
      description="Upload a receipt for this expense item"
    >
      <ExpenseReceiptUpload
        workOrderId={workOrderId}
        expense={expense}
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
