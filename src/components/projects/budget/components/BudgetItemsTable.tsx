import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

// Update type definition to match ProjectBudget.tsx
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
  subcontractors?: { subname: string | null } | null;
  document_id?: string | null;
};

interface BudgetItemsTableProps {
  items: BudgetItemWithDetails[]; // Use updated type
  onEditItem: (item: BudgetItemWithDetails) => void; // Use updated type
  onDeleteItem: (item: BudgetItemWithDetails) => void; // Use updated type
  onRowClick: (item: BudgetItemWithDetails) => void; // Use updated type
}

const BudgetItemsTable: React.FC<BudgetItemsTableProps> = ({
  items,
  onEditItem,
  onDeleteItem,
  onRowClick,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-md">
        No budget items found for this project.
      </div>
    );
  }

  // Calculate Totals for Footer using newly available direct fields
  const totalSellingPrice = items.reduce((sum, item) => sum + (item.selling_total_price || 0), 0);
  const totalBaseCost = items.reduce(
    (sum, item) => sum + (item.base_cost || 0) * (item.quantity || 1),
    0
  );
  const totalActualCost = items.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const totalCostVariance = totalBaseCost - totalActualCost;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total Est. Cost</TableHead>
            <TableHead className="text-right">Total Est. Price</TableHead>
            <TableHead className="text-right">Actual Cost</TableHead>
            <TableHead className="text-right">Cost Variance</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            // Use direct fields from the item
            const quantity = item.quantity || 1;
            const baseUnitCost = item.base_cost || 0;
            const sellingUnitPrice = item.selling_unit_price || 0;
            const totalEstCost = baseUnitCost * quantity;
            const totalEstSellingPrice = item.selling_total_price || sellingUnitPrice * quantity;
            const actualCost = item.actual_amount || 0; // Assuming actual_amount is actual COST
            const costVariance = totalEstCost - actualCost;
            const isContingency = item.is_contingency;

            return (
              <TableRow
                key={item.id}
                className={`cursor-pointer hover:bg-muted/50 ${isContingency ? 'bg-blue-50' : ''}`}
                onClick={() => onRowClick(item)}
              >
                <TableCell className="font-medium">{item.category || 'Uncat.'}</TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell className="text-right">{quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(baseUnitCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(sellingUnitPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalEstCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalEstSellingPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(actualCost)}</TableCell>
                <TableCell
                  className={`text-right ${costVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {formatCurrency(costVariance)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={e => {
                        e.stopPropagation();
                        onEditItem(item);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteItem(item);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-muted/50 font-medium">
          <TableRow>
            <TableCell colSpan={5}>Totals</TableCell>
            <TableCell className="text-right">{formatCurrency(totalBaseCost)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalSellingPrice)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalActualCost)}</TableCell>
            <TableCell
              className={`text-right ${totalCostVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {formatCurrency(totalCostVariance)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default BudgetItemsTable;
