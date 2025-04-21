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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Define a type for budget items (adjust based on actual schema if needed)
interface BudgetLineItem {
  id: string;
  category: string;
  description: string | null;
  estimated_amount: number; // Represents Estimated Revenue (Selling Price)
  actual_amount?: number | null; // Represents Actual COST incurred
  estimated_cost?: number | null; // Add Estimated COST
}

interface ProjectBudgetTabProps {
  budgetItems: BudgetLineItem[];
  totalBudget: number | null; // This is the total REVENUE budget from the project record
  // We might need total spent later if not directly on items
}

const ProjectBudgetTab: React.FC<ProjectBudgetTabProps> = ({ budgetItems, totalBudget }) => {
  // Calculate totals from the items provided
  const totalEstimatedRevenue = budgetItems.reduce(
    (sum, item) => sum + (item.estimated_amount || 0),
    0
  );
  const totalEstimatedCost = budgetItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
  const totalActualCost = budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);

  // Calculate Margins
  const estimatedGrossMargin = totalEstimatedRevenue - totalEstimatedCost;
  const actualGrossMargin = totalEstimatedRevenue - totalActualCost; // Assuming revenue doesn't change, only cost does

  // Calculate Variances
  const totalCostVariance = totalEstimatedCost - totalActualCost; // Positive means under budget, negative means over budget
  const overallProjectVariance = (totalBudget || 0) - totalActualCost; // Comparing original project budget (revenue) vs actual cost

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Budget vs. Actual</CardTitle>
        {/* TODO: Add actions like 'Add Budget Item' or 'Import' ? */}
      </CardHeader>
      <CardContent>
        {budgetItems.length === 0 ? (
          <p className="text-muted-foreground">No budget items found for this project.</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Est. Revenue</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                  <TableHead className="text-right">Actual Cost</TableHead>
                  <TableHead className="text-right">Cost Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.map(item => {
                  const estimatedRevenue = item.estimated_amount || 0;
                  const estimatedCost = item.estimated_cost || 0;
                  const actualCost = item.actual_amount || 0; // Assuming actual_amount tracks cost
                  const costVariance = estimatedCost - actualCost;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.category || 'Uncategorized'}
                      </TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(estimatedRevenue)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(estimatedCost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(actualCost)}</TableCell>
                      <TableCell
                        className={`text-right ${costVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {formatCurrency(costVariance)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter className="bg-muted/50 font-medium">
                <TableRow>
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalEstimatedRevenue)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(totalEstimatedCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalActualCost)}</TableCell>
                  <TableCell
                    className={`text-right ${totalCostVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatCurrency(totalCostVariance)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t">
                  <TableCell colSpan={2} className="text-sm">
                    Est. Gross Margin
                  </TableCell>
                  <TableCell colSpan={4} className="text-right text-sm">
                    {formatCurrency(estimatedGrossMargin)} (
                    {totalEstimatedRevenue > 0
                      ? ((estimatedGrossMargin / totalEstimatedRevenue) * 100).toFixed(1)
                      : 0}
                    %)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="text-sm">
                    Actual Gross Margin
                  </TableCell>
                  <TableCell colSpan={4} className="text-right text-sm">
                    {formatCurrency(actualGrossMargin)} (
                    {totalEstimatedRevenue > 0
                      ? ((actualGrossMargin / totalEstimatedRevenue) * 100).toFixed(1)
                      : 0}
                    %)
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetTab;
