
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  onCancel
}) => {
  const handleConfirm = () => {
    onConfirm();
  };
  
  const handleCancel = () => {
    onCancel();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Receipts</DialogTitle>
          <DialogDescription>
            Would you like to attach receipts to this time entry?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Receipt className="h-8 w-8 text-[#0485ea]" />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleConfirm} className="bg-[#0485ea] hover:bg-[#0375d1]">
            Yes, Add Receipts
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            No, Skip This Step
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPromptDialog;
