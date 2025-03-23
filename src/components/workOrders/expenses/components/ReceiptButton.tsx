
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderExpense } from '@/types/workOrder';

interface ReceiptButtonProps {
  expense: WorkOrderExpense;
  onClick: (expense: WorkOrderExpense) => void;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({ expense, onClick }) => {
  // For time entry expenses, we should only allow viewing, not uploading
  const isTimeEntryExpense = expense.source_type === 'time_entry';
  const hasReceipt = Boolean(expense.receipt_document_id);
  
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
          : "text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
      }
      disabled={isTimeEntryExpense && !hasReceipt}
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
