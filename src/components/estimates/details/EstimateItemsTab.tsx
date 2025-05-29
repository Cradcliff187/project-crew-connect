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
        <CardTitle className="font-montserrat">Estimate Line Items</CardTitle>
        <CardDescription className="font-opensans">
          Detailed breakdown of estimate costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-opensans">Description</TableHead>
                <TableHead className="text-right font-opensans">Quantity</TableHead>
                <TableHead className="text-right font-opensans">Unit Price</TableHead>
                <TableHead className="text-right font-opensans">Total</TableHead>
                {showFinancialDetails && (
                  <>
                    <TableHead className="text-right font-opensans">Cost</TableHead>
                    <TableHead className="text-right font-opensans">Margin</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const itemCost = Number(item.cost || 0) * Number(item.quantity || 1);
                const itemMargin = Number(item.total_price || 0) - itemCost;
                const itemMarginPercentage =
                  Number(item.total_price || 0) > 0
                    ? (itemMargin / Number(item.total_price || 0)) * 100
                    : 0;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-opensans">
                      <div>
                        <div className="font-medium">{item.description}</div>
                        {item.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{item.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-opensans">{item.quantity}</TableCell>
                    <TableCell className="text-right font-opensans">
                      {formatCurrency(Number(item.unit_price || 0))}
                    </TableCell>
                    <TableCell className="text-right font-medium font-opensans">
                      {formatCurrency(Number(item.total_price || 0))}
                    </TableCell>
                    {showFinancialDetails && (
                      <>
                        <TableCell className="text-right font-opensans">
                          {formatCurrency(itemCost)}
                        </TableCell>
                        <TableCell className="text-right font-opensans">
                          <div className="flex flex-col">
                            <span>{formatCurrency(itemMargin)}</span>
                            <span
                              className={`text-xs ${
                                itemMarginPercentage >= 20
                                  ? 'text-green-600'
                                  : itemMarginPercentage >= 10
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {itemMarginPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-opensans">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculateTotal())}</span>
              </div>
              {showFinancialDetails && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground font-opensans">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(calculateTotalCost())}</span>
                  </div>
                  <div className="flex justify-between text-sm font-opensans">
                    <span>Gross Margin:</span>
                    <span
                      className={
                        calculateTotalMarginPercentage() >= 20
                          ? 'text-green-600'
                          : calculateTotalMarginPercentage() >= 10
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }
                    >
                      {formatCurrency(calculateTotalMargin())} (
                      {calculateTotalMarginPercentage().toFixed(1)}%)
                    </span>
                  </div>
                </>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold font-opensans">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateItemsTab;
