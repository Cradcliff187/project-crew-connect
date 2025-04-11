
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto bg-gray-100 p-3 rounded-full w-fit">
            <Receipt className="h-6 w-6 text-[#0485ea]" />
          </div>
          <DialogTitle className="text-center pt-2">Add Receipt?</DialogTitle>
          <DialogDescription className="text-center">
            Do you have any receipts for this time entry that you would like to upload?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-center gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            No, Skip
          </Button>
          <Button 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={onConfirm}
          >
            Yes, Upload Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPromptDialog;
