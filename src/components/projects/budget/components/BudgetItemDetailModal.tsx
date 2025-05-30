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

type BudgetItemWithDetails = Database['public']['Tables']['project_budget_items']['Row'] & {
  quantity?: number | null;
  base_cost?: number | null;
  selling_unit_price?: number | null;
  markup_percentage?: number | null;
  markup_amount?: number | null;
  selling_total_price?: number | null;
  gross_margin_percentage?: number | null;
  gross_margin_amount?: number | null;
  notes?: string | null;
  cost_code_id?: string | null;
  category_id?: string | null;
  vendors?: { vendorname: string | null } | null;
  subcontractors?: { company_name: string | null } | null;
  document_id?: string | null;
};

interface BudgetItemDetailModalProps {
  item: BudgetItemWithDetails | null;
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

  const quantity = item.quantity || 1;
  const baseUnitCost = item.base_cost || 0;
  const sellingUnitPrice = item.selling_unit_price || 0;
  const markupPercentage = item.markup_percentage || 0;
  const estTotalCost = baseUnitCost * quantity;
  const estTotalSellingPrice = item.selling_total_price || sellingUnitPrice * quantity;
  const estGrossMarginAmount = item.gross_margin_amount || estTotalSellingPrice - estTotalCost;

  const actualCost = item.actual_amount || 0;
  const costVariance = estTotalCost - actualCost;

  const vendorName = item.vendors?.vendorname;
  const subcontractorName = item.subcontractors?.company_name;
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

            {vendorName && (
              <>
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{vendorName}</span>
              </>
            )}
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
            {item.notes && (
              <>
                <span className="text-muted-foreground self-start">Notes:</span>
                <span className="whitespace-pre-wrap">{item.notes}</span>
              </>
            )}
          </div>

          {/* --- Financial Details Section --- */}
          <>
            <hr />
            <div className="grid grid-cols-4 items-center gap-x-2 gap-y-2 text-sm">
              <span className="text-muted-foreground col-span-1 text-right">Quantity:</span>
              <span className="font-medium col-span-1">{quantity}</span>
              <span className="text-muted-foreground col-span-1 text-right">Unit Cost:</span>
              <span className="font-medium col-span-1">{formatCurrency(baseUnitCost)}</span>

              <span className="text-muted-foreground col-span-1 text-right">Markup %:</span>
              <span className="font-medium col-span-1">{markupPercentage.toFixed(1)}%</span>
              <span className="text-muted-foreground col-span-1 text-right">Unit Price:</span>
              <span className="font-medium col-span-1">{formatCurrency(sellingUnitPrice)}</span>

              <span className="text-muted-foreground col-span-1 text-right font-semibold">
                Total Est Cost:
              </span>
              <span className="font-semibold col-span-1">{formatCurrency(estTotalCost)}</span>
              <span className="text-muted-foreground col-span-1 text-right font-semibold">
                Total Est Price:
              </span>
              <span className="font-semibold col-span-1">
                {formatCurrency(estTotalSellingPrice)}
              </span>

              <span className="text-muted-foreground col-span-1 text-right">Est GM Amt:</span>
              <span className="font-medium col-span-1">{formatCurrency(estGrossMarginAmount)}</span>
              <span className="text-muted-foreground col-span-1 text-right">Est GM %:</span>
              <span className="font-medium col-span-1">
                {item.gross_margin_percentage
                  ? `${item.gross_margin_percentage.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </>

          {/* --- Actuals & Variance Section --- */}
          <>
            <hr />
            <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground">Actual Cost:</span>
              <span className="font-semibold">{formatCurrency(actualCost)}</span>

              <span className="text-muted-foreground">Cost Variance:</span>
              <span
                className={`font-semibold ${costVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {formatCurrency(costVariance)}
                {costVariance !== 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({costVariance > 0 ? 'Under' : 'Over'} Budget)
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
