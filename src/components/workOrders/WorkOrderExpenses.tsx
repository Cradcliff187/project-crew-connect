
import { useState } from 'react';
import { useWorkOrderExpenses } from './expenses/hooks/useWorkOrderExpenses';
import { ExpensesInfoSection } from './expenses/components';
import { WorkOrderExpense } from '@/types/workOrder';
import { DocumentViewerDialog } from '@/components/documents';

interface WorkOrderExpensesProps {
  workOrderId: string;
  onExpenseAdded?: () => void;
}

const WorkOrderExpenses = ({ workOrderId, onExpenseAdded }: WorkOrderExpensesProps) => {
  const [selectedExpense, setSelectedExpense] = useState<WorkOrderExpense | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const {
    expenses,
    loading,
    vendors,
    totalExpensesCost,
    submitting,
    handleAddExpense,
    handleDelete,
    handleReceiptAttached,
    fetchExpenses
  } = useWorkOrderExpenses(workOrderId);
  
  const handleVendorAdded = () => {
    fetchExpenses();
  };
  
  const handleExpenseAdded = () => {
    fetchExpenses();
    if (onExpenseAdded) onExpenseAdded();
  };
  
  const handleExpensePrompt = async (expenseData: any) => {
    await handleAddExpense(expenseData);
    handleExpenseAdded();
  };
  
  const handleReceiptClick = (expense: WorkOrderExpense) => {
    setSelectedExpense(expense);
    setReceiptDialogOpen(true);
  };
  
  const handleReceiptClosed = () => {
    setReceiptDialogOpen(false);
    setSelectedExpense(null);
  };
  
  return (
    <>
      <ExpensesInfoSection
        expenses={expenses}
        loading={loading}
        submitting={submitting}
        vendors={vendors}
        totalExpensesCost={totalExpensesCost}
        workOrderId={workOrderId}
        onExpensePrompt={handleExpensePrompt}
        onDelete={handleDelete}
        onReceiptAttached={handleReceiptAttached}
        onVendorAdded={handleVendorAdded}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Receipt Document Viewer Dialog */}
      {selectedExpense && (
        <DocumentViewerDialog
          open={receiptDialogOpen}
          onOpenChange={handleReceiptClosed}
          documentId={selectedExpense.receipt_document_id}
          title={`Receipt for ${selectedExpense.expense_name}`}
          entityId={workOrderId}
          entityType="WORK_ORDER"
          onDocumentUploaded={(documentId) => {
            handleReceiptAttached(selectedExpense.id, documentId);
            handleReceiptClosed();
          }}
          allowUploads={!selectedExpense.receipt_document_id}
          uploadCategory="receipt"
          uploadLabel="Upload Receipt"
        />
      )}
    </>
  );
};

export default WorkOrderExpenses;
