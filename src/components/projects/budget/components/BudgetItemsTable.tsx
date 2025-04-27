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

type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];

interface BudgetItemsTableProps {
  items: BudgetItem[];
  // Add handlers later if needed
  // onEditItem: (item: BudgetItem) => void;
  // onDeleteItem: (item: BudgetItem) => void;
}

const BudgetItemsTable: React.FC<BudgetItemsTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-md">
        No budget items found for this project.
      </div>
    );
  }

  // Calculate Totals for Footer
  const totalEstAmount = items.reduce((sum, item) => sum + (item.estimated_amount || 0), 0);
  const totalActualAmount = items.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const totalEstCost = items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
  const totalVariance = totalEstCost - totalActualAmount; // Assuming actual_amount tracks COST

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Est. Amount</TableHead>
            <TableHead className="text-right">Est. Cost</TableHead>
            <TableHead className="text-right">Actual Cost</TableHead>
            <TableHead className="text-right">Variance</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const estAmount = item.estimated_amount || 0;
            const estCost = item.estimated_cost || 0;
            const actualCost = item.actual_amount || 0;
            const variance = estCost - actualCost;
            const isContingency = item.is_contingency;

            return (
              <TableRow key={item.id} className={isContingency ? 'bg-blue-50' : ''}>
                <TableCell className="font-medium">{item.category || 'Uncat.'}</TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell className="text-right">{formatCurrency(estAmount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(estCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(actualCost)}</TableCell>
                <TableCell
                  className={`text-right ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {formatCurrency(variance)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => console.log('Edit TBD', item.id)}
                    >
                      {' '}
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => console.log('Delete TBD', item.id)}
                    >
                      {' '}
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
            <TableCell colSpan={2}>Totals</TableCell>
            <TableCell className="text-right">{formatCurrency(totalEstAmount)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalEstCost)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalActualAmount)}</TableCell>
            <TableCell
              className={`text-right ${totalVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {formatCurrency(totalVariance)}
            </TableCell>
            <TableCell />
            {/* Actions column footer */}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default BudgetItemsTable;
