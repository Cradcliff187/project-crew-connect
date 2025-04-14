import React from 'react';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimeEntryFormValues } from '@/types/timeTracking';

// Add type information comment to clarify usage
// TimeEntryFormValues is a TypeScript interface for form values

interface WorkOrderOrProject {
  id: string;
  title: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  status?: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmationData: TimeEntryFormValues | null;
  employees: { employee_id: string; name: string }[];
  entityType: 'work_order' | 'project';
  workOrders: WorkOrderOrProject[];
  projects: WorkOrderOrProject[];
  selectedFiles: File[];
  isLoading: boolean;
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  confirmationData,
  employees,
  entityType,
  workOrders,
  projects,
  selectedFiles,
  isLoading,
  onConfirm,
}) => {
  if (!confirmationData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Time Entry</DialogTitle>
          <DialogDescription>Please review the details before submitting</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Type:</div>
            <div className="font-medium capitalize">
              {confirmationData.entityType.replace('_', ' ')}
            </div>

            <div className="text-muted-foreground">Name:</div>
            <div className="font-medium">
              {entityType === 'work_order'
                ? workOrders.find(wo => wo.id === confirmationData.entityId)?.title
                : projects.find(p => p.id === confirmationData.entityId)?.title}
            </div>

            <div className="text-muted-foreground">Date:</div>
            <div className="font-medium">{format(confirmationData.workDate, 'MMMM d, yyyy')}</div>

            <div className="text-muted-foreground">Time:</div>
            <div className="font-medium">
              {formatTimeRange(confirmationData.startTime, confirmationData.endTime)}
            </div>

            <div className="text-muted-foreground">Duration:</div>
            <div className="font-medium">{confirmationData.hoursWorked} hours</div>

            {confirmationData.employeeId && employees.length > 0 && (
              <>
                <div className="text-muted-foreground">Employee:</div>
                <div className="font-medium">
                  {employees.find(e => e.employee_id === confirmationData.employeeId)?.name}
                </div>
              </>
            )}

            {confirmationData.notes && (
              <>
                <div className="text-muted-foreground">Notes:</div>
                <div className="font-medium">{confirmationData.notes}</div>
              </>
            )}

            {selectedFiles.length > 0 && (
              <>
                <div className="text-muted-foreground">Receipts:</div>
                <div className="font-medium">{selectedFiles.length} file(s) attached</div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Time Entry'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
