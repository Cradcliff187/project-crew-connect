import { useState } from 'react';

type ExpenseData = {
  expenseName: string;
  quantity: number;
  unitPrice: number;
  vendorId: string | null;
  expenseType: string;
};

export function useConfirmationManager(
  handleAddExpense: (expense: ExpenseData) => Promise<any>,
  handleReceiptUploaded: () => void,
  handleExpenseAdded: () => void
) {
  // State for receipt confirmation dialog
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<{
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType: string;
  } | null>(null);

  // For setting up selected expense
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Handle prompt for receipt upload
  const handlePromptForReceipt = (expense: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType: string;
  }) => {
    setPendingExpense(expense);
    setShowReceiptConfirmation(true);
  };

  // Handle confirmation to add expense with receipt
  const handleConfirmWithReceipt = async () => {
    if (!pendingExpense) return;

    try {
      console.log('Adding expense and then showing receipt upload dialog');
      // Create the expense
      const newExpense = await handleAddExpense(pendingExpense);

      // Show the receipt upload dialog for the new expense
      if (newExpense) {
        setSelectedExpense(newExpense);
        return { showReceiptUpload: true, selectedExpense: newExpense };
      } else {
        console.log('No expense returned from handleAddExpense');
      }

      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingExpense(null);

      // Refresh the expenses list
      handleExpenseAdded();

      return { showReceiptUpload: false, selectedExpense: null };
    } catch (error) {
      console.error('Error in handleConfirmWithReceipt:', error);
      return { showReceiptUpload: false, selectedExpense: null };
    }
  };

  // Handle confirmation to add expense without receipt
  const handleConfirmWithoutReceipt = async () => {
    if (!pendingExpense) return;

    try {
      await handleAddExpense(pendingExpense);

      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingExpense(null);

      // Refresh the expenses list
      handleExpenseAdded();
    } catch (error) {
      console.error('Error in handleConfirmWithoutReceipt:', error);
    }
  };

  return {
    showReceiptConfirmation,
    setShowReceiptConfirmation,
    pendingExpense,
    handlePromptForReceipt,
    handleConfirmWithReceipt,
    handleConfirmWithoutReceipt,
  };
}
