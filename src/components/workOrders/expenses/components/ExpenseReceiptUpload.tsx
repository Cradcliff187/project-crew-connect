import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { WorkOrderExpense } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';

interface ExpenseReceiptUploadProps {
  workOrderId: string;
  expense: WorkOrderExpense;
  vendorName: string;
  onSuccess: (documentId: string) => void;
  onCancel: () => void;
}

const ExpenseReceiptUpload: React.FC<ExpenseReceiptUploadProps> = ({
  workOrderId,
  expense,
  vendorName,
  onSuccess,
  onCancel,
}) => {
  // Prefill data for receipt upload with more context
  const prefillData = {
    amount: expense.total_price,
    vendorId: expense.vendor_id || undefined,
    expenseName: expense.expense_name,
    category: 'receipt',
    notes: `Receipt for ${expense.expense_name} (${vendorName})`,
    tags: ['receipt', 'work_order_expense', expense.expense_type?.toLowerCase() || 'material'],
  };

  console.log('ExpenseReceiptUpload component rendering with:', {
    workOrderId,
    expenseId: expense.id,
    prefillData,
  });

  // Handle successful upload
  const handleSuccess = (documentId?: string) => {
    console.log('Document upload success, got ID:', documentId);
    if (documentId) {
      onSuccess(documentId);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to get document ID after upload',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-none border-0 p-0">
      <CardContent className="p-0">
        <EnhancedDocumentUpload
          entityType="WORK_ORDER"
          entityId={workOrderId}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          isReceiptUpload={true}
          prefillData={prefillData}
        />
      </CardContent>
    </Card>
  );
};

export default ExpenseReceiptUpload;
