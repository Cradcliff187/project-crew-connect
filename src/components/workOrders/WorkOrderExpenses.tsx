
import { useState } from 'react';
import { useExpenses } from './expenses/hooks/useExpenses';
import { ExpensesInfoSection } from './expenses/components';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import { WorkOrderExpense } from '@/types/workOrder';

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
    handleReceiptUploaded,
    fetchExpenses
  } = useExpenses(workOrderId);
  
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
  
  // Handle receipt upload and handle the boolean return, but we don't need to return anything
  const handleReceiptUpload = async (expenseId: string, documentId: string) => {
    await handleReceiptUploaded(expenseId, documentId);
    // We don't need to return anything here, void is fine
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
        onReceiptAttached={handleReceiptUpload}
        onVendorAdded={handleVendorAdded}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Receipt Document Viewer Dialog */}
      {selectedExpense && (
        <DocumentViewerDialog
          open={receiptDialogOpen}
          onOpenChange={handleReceiptClosed}
          document={selectedExpense.receipt_document_id ? {
            document_id: selectedExpense.receipt_document_id,
            file_name: `Receipt for ${selectedExpense.expense_name}`,
            file_type: 'application/pdf', // Default type, will be determined by the component
            url: '', // Will be populated by the component
            storage_path: '',
            entity_type: 'WORK_ORDER',
            entity_id: workOrderId,
            created_at: '',
            updated_at: '',
            tags: []
          } : null}
          title={`Receipt for ${selectedExpense.expense_name}`}
          description="Receipt document preview"
        />
      )}
    </>
  );
};

export default WorkOrderExpenses;
