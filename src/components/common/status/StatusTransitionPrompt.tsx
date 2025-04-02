
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusOption } from './UniversalStatusControl';

interface StatusTransitionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  statusOptions: StatusOption[];
  pendingStatus: string;
  notes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const StatusTransitionPrompt: React.FC<StatusTransitionPromptProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  statusOptions,
  pendingStatus,
  notes,
  onNotesChange
}) => {
  const getStatusLabel = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onCancel();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Status Change</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4">
            Are you sure you want to change the status to <strong>{getStatusLabel(pendingStatus)}</strong>?
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="transition-notes">Add notes (optional)</Label>
            <Textarea
              id="transition-notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={onNotesChange}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
          >
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusTransitionPrompt;
