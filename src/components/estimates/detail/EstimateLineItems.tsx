
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimateLineItemsProps {
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    cost?: number;
    markup_percentage?: number;
    markup_amount?: number;
    gross_margin?: number;
    gross_margin_percentage?: number;
  }[];
}

const EstimateLineItems: React.FC<EstimateLineItemsProps> = ({ items }) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Quantity</TableHead>
              <TableHead className="w-[15%] text-right">Unit Price</TableHead>
              <TableHead className="w-[20%] text-right">Total</TableHead>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No line items available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end mt-4">
        <div className="w-48">
          <div className="flex justify-between py-2 text-sm border-t">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateLineItems;
