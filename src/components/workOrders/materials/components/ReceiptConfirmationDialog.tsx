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
  materialData: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  } | null;
  vendorName: string;
  onConfirmWithReceipt: () => void;
  onConfirmWithoutReceipt: () => void;
}

const ReceiptConfirmationDialog = ({
  open,
  onOpenChange,
  materialData,
  vendorName,
  onConfirmWithReceipt,
  onConfirmWithoutReceipt,
}: ReceiptConfirmationDialogProps) => {
  if (!materialData) return null;

  const totalPrice = materialData.quantity * materialData.unitPrice;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you need to upload a receipt?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to attach a receipt for this material purchase?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Material:</div>
            <div className="font-medium">{materialData.materialName}</div>

            <div className="text-muted-foreground">Quantity:</div>
            <div className="font-medium">{materialData.quantity}</div>

            <div className="text-muted-foreground">Unit Price:</div>
            <div className="font-medium">{formatCurrency(materialData.unitPrice)}</div>

            <div className="text-muted-foreground">Total:</div>
            <div className="font-medium">{formatCurrency(totalPrice)}</div>

            {materialData.vendorId && (
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
