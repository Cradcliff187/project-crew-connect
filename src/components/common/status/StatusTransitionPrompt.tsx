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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusOption } from './UniversalStatusControl';

interface StatusTransitionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  notes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  statusOptions: StatusOption[];
  pendingStatus: string;
}

const StatusTransitionPrompt: React.FC<StatusTransitionPromptProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  notes,
  onNotesChange,
  statusOptions,
  pendingStatus,
}) => {
  const getStatusLabel = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogDescription>
            You are about to change the status to <strong>{getStatusLabel(pendingStatus)}</strong>.
            Would you like to add any notes?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="transition-notes">Notes (optional)</Label>
          <Textarea
            id="transition-notes"
            value={notes}
            onChange={onNotesChange}
            placeholder="Add any relevant information about this status change..."
            className="mt-2"
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-[#0485ea] hover:bg-[#0375d1]">
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusTransitionPrompt;
