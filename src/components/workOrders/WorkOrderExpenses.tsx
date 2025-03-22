
import { useState } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';

// Import hooks
import { useExpenses, useVendors } from './expenses/hooks';
import { useReceiptManager } from './expenses/hooks/useReceiptManager';
import { useConfirmationManager } from './expenses/hooks/useConfirmationManager';

// Import components
import { ExpensesErrorAlert, ExpensesInfoSection, ReceiptConfirmationDialog } from './expenses/components';
import { ReceiptViewerDialog, ReceiptUploadDialog } from './expenses/dialogs/ReceiptDialog';

interface WorkOrderExpensesProps {
  workOrderId: string;
  onExpenseAdded?: () => void;
}

const WorkOrderExpenses = ({ workOrderId, onExpenseAdded }: WorkOrderExpensesProps) => {
  const { 
    expenses, 
    loading, 
    submitting, 
    error,
    totalExpensesCost,
    handleAddExpense, 
    handleDelete,
    handleReceiptUploaded,
    fetchExpenses
  } = useExpenses(workOrderId);
  
  const { vendors, loading: vendorsLoading, error: vendorsError, fetchVendors } = useVendors();
  
  // Handle expense added
  const handleExpenseAdded = () => {
    // Refresh expenses list
    fetchExpenses();

    // Notify parent component if provided
    if (onExpenseAdded) {
      onExpenseAdded();
    }
  };
  
  // Handle vendor added
  const handleVendorAdded = () => {
    // Refresh vendors list
    fetchVendors();
  };
  
  // Use the receipt manager hook
  const {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedExpense,
    setSelectedExpense,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  } = useReceiptManager();
  
  // Use the confirmation manager hook
  const {
    showReceiptConfirmation,
    setShowReceiptConfirmation,
    pendingExpense,
    handlePromptForReceipt,
    handleConfirmWithReceipt,
    handleConfirmWithoutReceipt
  } = useConfirmationManager(handleAddExpense, handleReceiptUploaded, handleExpenseAdded);
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return "";
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : "Unknown Vendor";
  };
  
  // Handle confirmation to add expense with receipt
  const confirmWithReceipt = async () => {
    const result = await handleConfirmWithReceipt();
    if (result?.showReceiptUpload) {
      setShowReceiptUpload(true);
      setSelectedExpense(result.selectedExpense);
      setShowReceiptConfirmation(false);
    }
  };
  
  // Handle receipt uploaded
  const handleReceiptAttached = async (expenseId: string, documentId: string) => {
    console.log("Receipt attached. Expense ID:", expenseId, "Document ID:", documentId);
    await handleReceiptUploaded(expenseId, documentId);
    setShowReceiptUpload(false);
    
    // Refresh the expenses list
    handleExpenseAdded();
  };
  
  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <ExpensesErrorAlert error={error || vendorsError} />
      
      {/* Main Expenses Section - Now prioritizing the table view */}
      <ExpensesInfoSection 
        expenses={expenses}
        loading={loading}
        submitting={submitting}
        vendors={vendors}
        totalExpensesCost={totalExpensesCost}
        workOrderId={workOrderId}
        onExpensePrompt={handlePromptForReceipt}
        onDelete={handleDelete}
        onReceiptAttached={handleReceiptAttached}
        onVendorAdded={handleVendorAdded}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Dialogs - no changes needed */}
      <ReceiptConfirmationDialog
        open={showReceiptConfirmation}
        onOpenChange={setShowReceiptConfirmation}
        expenseData={pendingExpense}
        vendorName={pendingExpense?.vendorId ? getVendorName(pendingExpense.vendorId) : ""}
        onConfirmWithReceipt={confirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />
      
      <ReceiptUploadDialog
        open={showReceiptUpload}
        expense={selectedExpense}
        workOrderId={workOrderId}
        vendorName={selectedExpense?.vendor_id ? getVendorName(selectedExpense.vendor_id) : ""}
        onSuccess={handleReceiptAttached}
        onCancel={() => setShowReceiptUpload(false)}
      />
      
      <ReceiptViewerDialog
        open={viewingReceipt}
        onOpenChange={(open) => !open && handleCloseReceiptViewer()}
        receiptDocument={receiptDocument}
      />
    </div>
  );
};

export default WorkOrderExpenses;
