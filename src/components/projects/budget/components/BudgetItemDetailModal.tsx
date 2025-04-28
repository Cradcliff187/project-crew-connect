import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { FileText } from 'lucide-react';

type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'] & {
  document_id?: string | null;
  vendors?: { vendorname: string | null } | null;
  subcontractors?: { subname: string | null } | null;
};

interface BudgetItemDetailModalProps {
  item: BudgetItem | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDocument: (documentId: string) => void;
}

const BudgetItemDetailModal: React.FC<BudgetItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onViewDocument,
}) => {
  if (!isOpen || !item) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const estAmount = item.estimated_amount || 0;
  const estCost = item.estimated_cost || 0;
  const actualCost = item.actual_amount || 0; // actual_amount likely tracks actual cost here
  const variance = estCost - actualCost;

  const vendorName = item.vendors?.vendorname;
  const subcontractorName = item.subcontractors?.subname;
  // @ts-ignore - Access document_id, ignoring potential type error from outdated types
  const documentId = item.document_id;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Budget Item Details</DialogTitle>
          <DialogDescription>Details for the selected budget line item.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* --- Core Details Section --- */}
          <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{item.category || 'Uncategorized'}</span>

            <span className="text-muted-foreground self-start">Description:</span>
            <span className="font-medium whitespace-pre-wrap">{item.description || 'N/A'}</span>

            {/* Display Vendor if available */}
            {vendorName && (
              <>
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{vendorName}</span>
              </>
            )}

            {/* Display Subcontractor if available */}
            {subcontractorName && (
              <>
                <span className="text-muted-foreground">Subcontractor:</span>
                <span className="font-medium">{subcontractorName}</span>
              </>
            )}

            {item.is_contingency && (
              <>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="w-fit">
                  Contingency Item
                </Badge>
              </>
            )}
          </div>

          {/* --- Financial Details Section --- */}
          <>
            <hr />
            <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground">Est. Amount:</span>
              <span className="font-semibold">{formatCurrency(estAmount)}</span>

              <span className="text-muted-foreground">Est. Cost:</span>
              <span className="font-semibold">{formatCurrency(estCost)}</span>

              <span className="text-muted-foreground">Actual Cost:</span>
              <span className="font-semibold">{formatCurrency(actualCost)}</span>

              <span className="text-muted-foreground">Cost Variance:</span>
              <span className={`font-semibold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(variance)}
                {variance !== 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({variance > 0 ? 'Under' : 'Over'} Budget)
                  </span>
                )}
              </span>
            </div>
          </>

          {/* --- Document Link (Conditional) --- */}
          {documentId && (
            <>
              <hr />
              <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Document:</span>
                <Button
                  variant="link"
                  size="sm"
                  className="justify-start p-0 h-auto font-normal"
                  onClick={() => onViewDocument(documentId!)}
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

export default BudgetItemDetailModal;
