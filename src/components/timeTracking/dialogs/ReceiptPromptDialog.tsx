
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt, X } from 'lucide-react';

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
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-[#0485ea]" />
            Add Receipt
          </DialogTitle>
          <DialogDescription>
            Do you have a receipt for this time entry?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="sm:order-1 order-2"
          >
            <X className="mr-2 size-4" />
            No Receipt
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-[#0485ea] hover:bg-[#0375d1] sm:order-2 order-1"
          >
            <Receipt className="mr-2 size-4" />
            Add Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPromptDialog;
