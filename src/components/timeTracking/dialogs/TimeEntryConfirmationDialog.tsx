
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Check, Clock, FileText, MapPin } from 'lucide-react';
import { formatHours, formatCurrency } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';

interface TimeEntryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: Partial<TimeEntry>;
  receipts: {
    count: number;
    totalAmount: number;
  };
  entityName?: string;
}

const TimeEntryConfirmationDialog: React.FC<TimeEntryConfirmationDialogProps> = ({
  open,
  onOpenChange,
  timeEntry,
  receipts,
  entityName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Time Entry Submitted</DialogTitle>
          <DialogDescription className="text-center">
            Your time entry has been successfully recorded
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="p-4 bg-muted rounded-md space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
                <span className="text-sm font-medium">Hours:</span>
              </div>
              <span className="font-semibold">{formatHours(timeEntry.hours_worked)}</span>
            </div>
            
            {entityName && (
              <div className="flex justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[#0485ea]" />
                  <span className="text-sm font-medium">For:</span>
                </div>
                <span className="font-semibold">{entityName}</span>
              </div>
            )}
            
            {receipts.count > 0 && (
              <div className="flex justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-[#0485ea]" />
                  <span className="text-sm font-medium">Receipts:</span>
                </div>
                <span className="font-semibold">{receipts.count} ({formatCurrency(receipts.totalAmount)})</span>
              </div>
            )}
            
            {timeEntry.notes && (
              <div className="pt-2">
                <div className="text-sm font-medium mb-1">Notes:</div>
                <div className="text-sm bg-background p-2 rounded">{timeEntry.notes}</div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryConfirmationDialog;
