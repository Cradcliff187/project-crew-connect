import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Added for potential close button
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expense } from '../hooks/useProjectExpenses'; // Assuming Expense type is here
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatTime } from '@/components/timeTracking/utils/timeUtils';
import { FileText } from 'lucide-react'; // For document view button

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDocument: (documentId: string) => void; // Pass handler for viewing documents
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onViewDocument,
}) => {
  if (!isOpen || !expense) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>Review the details of the selected expense.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{formatDate(expense.expense_date)}</span>

            <span className="text-muted-foreground self-start">Description:</span>
            <span className="font-medium whitespace-pre-wrap">{expense.description || 'N/A'}</span>

            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">{formatCurrency(expense.amount)}</span>

            <span className="text-muted-foreground">Category:</span>
            <span>
              {expense.expense_type === 'LABOR' ? (
                <Badge variant="secondary">Labor</Badge>
              ) : expense.budget_item_category ? (
                <Badge variant="outline">{expense.budget_item_category}</Badge>
              ) : (
                <span className="text-muted-foreground italic">Uncategorized</span>
              )}
            </span>

            <span className="text-muted-foreground">Vendor:</span>
            <span className="font-medium">{expense.vendor_name || 'N/A'}</span>
          </div>

          {expense.expense_type === 'LABOR' && (
            <>
              <hr />
              <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-medium">{expense.employee_name || 'Unknown'}</span>

                <span className="text-muted-foreground">Work Date:</span>
                <span>
                  {expense.timeEntryDetails?.date
                    ? formatDate(expense.timeEntryDetails.date)
                    : 'N/A'}
                </span>

                <span className="text-muted-foreground">Time Worked:</span>
                <span>
                  {expense.timeEntryDetails?.start || expense.timeEntryDetails?.end
                    ? `${formatTime(expense.timeEntryDetails?.start ?? '')} - ${formatTime(expense.timeEntryDetails?.end ?? '')}`
                    : 'N/A'}
                </span>

                <span className="text-muted-foreground">Hours:</span>
                <span>{expense.hours_worked?.toFixed(1) ?? 'N/A'} hrs</span>
              </div>
              {expense.timeEntryDetails?.notes && (
                <div className="mt-3 text-sm">
                  <p className="text-muted-foreground mb-1">Notes:</p>
                  <p className="border p-2 rounded-md bg-muted/50 whitespace-pre-wrap">
                    {expense.timeEntryDetails.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {expense.document_id && (
            <>
              <hr />
              <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Document:</span>
                <Button
                  variant="link"
                  size="sm"
                  className="justify-start p-0 h-auto font-normal"
                  onClick={() => onViewDocument(expense.document_id!)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Attached Document
                </Button>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailModal;
