import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import ExpenseReceiptUpload from '../components/ExpenseReceiptUpload';
import {
  ReceiptUploadDialog as SharedReceiptUploadDialog,
  ReceiptViewerDialog as SharedReceiptViewerDialog,
} from '../../common/ReceiptDialogManager';

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

  return (
    <SharedReceiptUploadDialog
      open={open}
      workOrderId={workOrderId}
      vendorName={vendorName}
      itemName="expense item"
      itemId={expense.id}
      onSuccess={onSuccess}
      onCancel={onCancel}
    >
      <ExpenseReceiptUpload
        workOrderId={workOrderId}
        expense={expense}
        vendorName={vendorName}
        onSuccess={documentId => documentId && onSuccess(expense.id, documentId)}
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
