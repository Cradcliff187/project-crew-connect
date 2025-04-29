import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderExpense } from '@/types/workOrder';
import { cn } from '@/lib/utils';

interface ReceiptButtonProps {
  expense: WorkOrderExpense;
  onClick: (expense: WorkOrderExpense) => void;
  isTimeEntryExpense?: boolean;
  className?: string;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({
  expense,
  onClick,
  isTimeEntryExpense = false,
  className,
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
      disabled={isDisabled}
      className={cn(
        'relative transition-colors duration-150 ease-in-out',
        hasReceipt
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
          : 'text-primary hover:text-primary/80 hover:bg-primary/10 border-primary/20',
        className
      )}
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
