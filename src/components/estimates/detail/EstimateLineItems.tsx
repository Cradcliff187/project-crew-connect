
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EstimateItem } from '../types/estimateTypes';

interface EstimateLineItemsProps {
  items: EstimateItem[];
  showFinancials?: boolean;
}

const EstimateLineItems: React.FC<EstimateLineItemsProps> = ({ 
  items,
  showFinancials = false 
}) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  
  // Calculate total cost if financial data is available and should be shown
  const totalCost = showFinancials 
    ? items.reduce((sum, item) => sum + (item.cost || 0), 0) 
    : 0;
    
  // Calculate total markup if financial data is available
  const totalMarkup = showFinancials 
    ? items.reduce((sum, item) => {
        const cost = item.cost || 0;
        const markup = item.markup_amount || (cost * (item.markup_percentage || 0) / 100) || 0;
        return sum + markup;
      }, 0)
    : 0;
  
  // Calculate gross margin
  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal * 100) : 0;

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="w-[10%] text-right">Quantity</TableHead>
              <TableHead className="w-[15%] text-right">Unit Price</TableHead>
              <TableHead className="w-[15%] text-right">Total</TableHead>
              {showFinancials && (
                <TableHead className="w-[10%] text-right">Cost</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate max-w-xs">
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
                  <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                  {showFinancials && (
                    <TableCell className="text-right">
                      {item.cost !== undefined ? formatCurrency(item.cost) : '—'}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showFinancials ? 5 : 4} className="h-24 text-center">
                  No line items available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end mt-4">
        <div className={showFinancials ? "w-64" : "w-48"}>
          <div className="flex justify-between py-2 text-sm border-t">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          {showFinancials && (
            <>
              <div className="flex justify-between py-2 text-sm border-t border-dashed">
                <span>Total Cost:</span>
                <span className="font-medium">{formatCurrency(totalCost)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm">
                <span>Markup:</span>
                <span className="font-medium">{formatCurrency(totalMarkup)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm border-t border-dashed">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        Gross Margin:
                        <Badge variant="outline" className="ml-1 text-[10px] h-4 bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {grossMarginPercentage.toFixed(1)}%
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Percentage of revenue that is profit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">{formatCurrency(grossMargin)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimateLineItems;
