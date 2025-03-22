
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderExpense } from '@/types/workOrder';

interface ReceiptButtonProps {
  expense: WorkOrderExpense;
  onClick: (expense: WorkOrderExpense) => void;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({ expense, onClick }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(expense)}
      className={
        expense.receipt_document_id
          ? "text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
          : "text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
      }
    >
      {expense.receipt_document_id ? (
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
