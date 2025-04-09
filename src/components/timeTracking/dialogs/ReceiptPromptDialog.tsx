
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Receipt } from 'lucide-react';

interface ReceiptPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReceiptPromptDialog: React.FC<ReceiptPromptDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}) => {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full bg-[#0485ea]/10">
              <Receipt className="h-6 w-6 text-[#0485ea]" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Add Receipts?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Would you like to upload receipts for this time entry?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Skip</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            Upload Receipts
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReceiptPromptDialog;
