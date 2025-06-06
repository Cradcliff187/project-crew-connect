import React from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Receipt } from 'lucide-react';

interface ReceiptConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseData: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType: string;
  } | null;
  vendorName: string;
  onConfirmWithReceipt: () => void;
  onConfirmWithoutReceipt: () => void;
}

const ReceiptConfirmationDialog = ({
  open,
  onOpenChange,
  expenseData,
  vendorName,
  onConfirmWithReceipt,
  onConfirmWithoutReceipt,
}: ReceiptConfirmationDialogProps) => {
  if (!expenseData) return null;

  const totalPrice = expenseData.quantity * expenseData.unitPrice;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Would you like to attach a receipt?</AlertDialogTitle>
          <AlertDialogDescription>
            Your expense has been created. You can attach a receipt now or add it later from the
            expenses list.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Expense:</div>
            <div className="font-medium">{expenseData.expenseName}</div>

            <div className="text-muted-foreground">Type:</div>
            <div className="font-medium capitalize">{expenseData.expenseType}</div>

            <div className="text-muted-foreground">Quantity:</div>
            <div className="font-medium">{expenseData.quantity}</div>

            <div className="text-muted-foreground">Unit Price:</div>
            <div className="font-medium">{formatCurrency(expenseData.unitPrice)}</div>

            <div className="text-muted-foreground">Total:</div>
            <div className="font-medium">{formatCurrency(totalPrice)}</div>

            {expenseData.vendorId && (
              <>
                <div className="text-muted-foreground">Vendor:</div>
                <div className="font-medium">{vendorName}</div>
              </>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onConfirmWithoutReceipt}>No Receipt</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmWithReceipt} className="text-white">
            <Receipt className="h-4 w-4 mr-2" />
            Upload Receipt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReceiptConfirmationDialog;
