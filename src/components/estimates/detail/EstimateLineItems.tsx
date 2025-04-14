import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EstimateItem } from '../types/estimateTypes';

interface EstimateLineItemsProps {
  items: EstimateItem[];
  showFinancials?: boolean;
}

const EstimateLineItems: React.FC<EstimateLineItemsProps> = ({ items, showFinancials = true }) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  // Calculate total cost if financial data is available and should be shown
  const totalCost = showFinancials
    ? items.reduce((sum, item) => sum + (item.cost || 0) * (item.quantity || 1), 0)
    : 0;

  // Calculate total markup if financial data is available
  const totalMarkup = showFinancials
    ? items.reduce((sum, item) => {
        const cost = (item.cost || 0) * (item.quantity || 1);
        const markup = item.markup_amount || (cost * (item.markup_percentage || 0)) / 100 || 0;
        return sum + markup;
      }, 0)
    : 0;

  // Calculate gross margin
  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              {showFinancials && (
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
              items.map(item => {
                const itemCost = (item.cost || 0) * (item.quantity || 1);
                const itemTotal = item.total_price || 0;
                const itemMargin = itemTotal - itemCost;
                const itemMarginPercentage = itemTotal > 0 ? (itemMargin / itemTotal) * 100 : 0;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-xs cursor-default">
                              {item.description}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <p className="text-sm">{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    {showFinancials && (
                      <>
                        <TableCell className="text-right">
                          {formatCurrency(item.cost || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.markup_percentage?.toFixed(1) || '0.0'}%
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`${itemMarginPercentage < 20 ? 'text-red-600' : itemMarginPercentage > 30 ? 'text-green-600' : ''}`}
                          >
                            {itemMarginPercentage.toFixed(1)}%
                          </span>
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={showFinancials ? 7 : 4} className="h-24 text-center">
                  No line items available
                </TableCell>
              </TableRow>
            )}

            {items.length > 0 && (
              <TableRow className="bg-gray-50 font-medium">
                <TableCell colSpan={2} className="text-right">
                  Totals:
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                {showFinancials && (
                  <>
                    <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`${grossMarginPercentage < 20 ? 'text-red-600' : grossMarginPercentage > 30 ? 'text-green-600' : ''}`}
                      >
                        {grossMarginPercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {items.length > 0 && showFinancials && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 bg-[#f8fafc] border rounded-md p-4">
            <h3 className="text-sm font-medium text-[#0485ea] mb-3">Financial Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500">Direct Costs</div>
                <div className="font-medium">{formatCurrency(totalCost)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Markup</div>
                <div className="font-medium">{formatCurrency(totalMarkup)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span>Gross Margin</span>
                  <Badge variant="outline" className="ml-1 text-xs bg-blue-50 text-blue-700">
                    {grossMarginPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="font-medium">{formatCurrency(grossMargin)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateLineItems;
