
import { useState } from 'react';
import { useWorkOrderExpenses } from './expenses/hooks/useWorkOrderExpenses';
import { ExpensesInfoSection } from './expenses/components';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';

interface WorkOrderExpensesProps {
  workOrderId: string;
  onExpenseAdded?: () => void;
}

const WorkOrderExpenses = ({ workOrderId, onExpenseAdded }: WorkOrderExpensesProps) => {
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
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
  
  const handleReceiptClick = (expense: any) => {
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
