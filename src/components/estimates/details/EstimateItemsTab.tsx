import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { EstimateItem } from '../types/estimateTypes';

type EstimateItemsTabProps = {
  items: EstimateItem[];
  showFinancialDetails?: boolean;
};

const EstimateItemsTab: React.FC<EstimateItemsTabProps> = ({
  items,
  showFinancialDetails = true,
}) => {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  };

  // Calculate the total cost and gross margin
  const calculateTotalCost = () => {
    return items.reduce(
      (sum, item) => sum + Number(item.cost || 0) * Number(item.quantity || 1),
      0
    );
  };

  const calculateTotalMargin = () => {
    return calculateTotal() - calculateTotalCost();
  };

  const calculateTotalMarginPercentage = () => {
    const total = calculateTotal();
    return total > 0 ? (calculateTotalMargin() / total) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Line Items</CardTitle>
        <CardDescription>Detailed breakdown of estimate costs</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              {showFinancialDetails && (
                <>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Markup %</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              <>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    {showFinancialDetails && (
                      <>
                        <TableCell className="text-right">
                          {formatCurrency(item.cost || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.markup_percentage?.toFixed(1) || 0}%
                        </TableCell>
                        <TableCell className="text-right">
                          {item.gross_margin_percentage?.toFixed(1) || 0}%
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                  </TableRow>
                ))}

                {/* Summary row */}
                <TableRow className="border-t-2">
                  <TableCell
                    colSpan={showFinancialDetails ? 3 : 3}
                    className="text-right font-bold"
                  >
                    Totals:
                  </TableCell>
                  {showFinancialDetails && (
                    <>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(calculateTotalCost())}
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                      <TableCell className="text-right font-bold">
                        {calculateTotalMarginPercentage().toFixed(1)}%
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right font-bold">
                    {formatCurrency(calculateTotal())}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showFinancialDetails ? 7 : 4}
                  className="text-center py-4 text-muted-foreground"
                >
                  No line items found for this estimate.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EstimateItemsTab;
