
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
    console.log('Vendor added, refreshing expenses...');
    fetchExpenses();
  };
  
  const handleExpenseAdded = () => {
    console.log('Expense added, refreshing expenses...');
    fetchExpenses();
    if (onExpenseAdded) onExpenseAdded();
  };
  
  const handleExpensePrompt = async (expenseData: any) => {
    console.log('Adding expense with data:', expenseData);
    await handleAddExpense(expenseData);
    handleExpenseAdded();
  };
  
  const handleReceiptClick = (expense: WorkOrderExpense) => {
    console.log('Receipt clicked for expense:', expense);
    setSelectedExpense(expense);
    setReceiptDialogOpen(true);
  };
  
  const handleReceiptClosed = () => {
    setReceiptDialogOpen(false);
    setSelectedExpense(null);
  };
  
  const handleReceiptUpload = async (expenseId: string, documentId: string) => {
    console.log('Uploading receipt for expense:', expenseId, 'with document ID:', documentId);
    await handleReceiptUploaded(expenseId, documentId);
    fetchExpenses();
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
