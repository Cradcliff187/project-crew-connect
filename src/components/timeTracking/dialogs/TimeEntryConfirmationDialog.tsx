
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types/timeTracking';
import { Check, Clock, Receipt } from 'lucide-react';
import { formatHours } from '@/lib/utils';
import { format } from 'date-fns';

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
  const handleClose = () => {
    onOpenChange(false);
  };
  
  if (!timeEntry) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Time Entry Complete</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-green-700 flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            <span>Your time has been logged successfully!</span>
          </div>
          
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{formatHours(timeEntry.hours_worked)} hours</p>
                <p className="text-sm text-muted-foreground">
                  {timeEntry.start_time} - {timeEntry.end_time}, {' '}
                  {timeEntry.date_worked && format(new Date(timeEntry.date_worked), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-4 w-4 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">{entityName || timeEntry.entity_type}</p>
                {timeEntry.notes && (
                  <p className="text-sm text-muted-foreground">{timeEntry.notes}</p>
                )}
              </div>
            </div>
            
            {receipts.count > 0 && (
              <div className="flex items-start">
                <Receipt className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">
                    {receipts.count} Receipt{receipts.count !== 1 ? 's' : ''}
                  </p>
                  {receipts.totalAmount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Total: ${receipts.totalAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={handleClose}
            className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryConfirmationDialog;
