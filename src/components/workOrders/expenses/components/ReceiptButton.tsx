
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderExpense } from '@/types/workOrder';

interface ReceiptButtonProps {
  expense: WorkOrderExpense;
  onClick: (expense: WorkOrderExpense) => void;
  isTimeEntryExpense?: boolean;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({ 
  expense, 
  onClick,
  isTimeEntryExpense = false
}) => {
  // Determine if expense has a receipt
  const hasReceipt = Boolean(expense.receipt_document_id);
  
  // For time entry expenses, we should only allow viewing, not uploading
  const isDisabled = isTimeEntryExpense && !hasReceipt;
  
  if (isTimeEntryExpense && !hasReceipt) {
    return null; // Don't show button for time entries without receipts
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(expense)}
      className={
        hasReceipt
          ? "text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
          : "text-[#0485ea] hover:text-[#0485ea]/80 hover:bg-[#0485ea]/10 border-[#0485ea]/20"
      }
      disabled={isDisabled}
    >
      {hasReceipt ? (
        <>
          <FileText className="h-4 w-4 mr-1" />
          View Receipt
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-1" />
          Upload Receipt
        </>
      )}
    </Button>
  );
};

export default ReceiptButton;
