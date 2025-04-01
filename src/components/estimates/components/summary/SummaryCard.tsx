
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { EstimateFormValues, EstimateItem } from '../../schemas/estimateFormSchema';

interface SummaryCardProps {
  contingencyAmount: number;
}

const SummaryCard = ({ contingencyAmount }: SummaryCardProps) => {
  const form = useFormContext<EstimateFormValues>();
  const items = form.watch('items') || [];
  
  // Calculate subtotal
  const subtotal = items.reduce((sum: number, item: EstimateItem) => {
    const cost = parseFloat(item.cost || '0');
    const markup = parseFloat(item.markup_percentage || '0');
    const markupAmount = cost * (markup / 100);
    const quantity = parseFloat(item.quantity || '1');
    return sum + ((cost + markupAmount) * quantity);
  }, 0);
  
  // Calculate grand total
  const grandTotal = subtotal + contingencyAmount;
  
  // Calculate total cost (for profit margin calculation)
  const totalCost = items.reduce((sum: number, item: EstimateItem) => {
    const cost = parseFloat(item.cost || '0');
    const quantity = parseFloat(item.quantity || '1');
    return sum + (cost * quantity);
  }, 0);
  
  // Calculate profit margin
  const grossProfit = grandTotal - totalCost;
  const grossMarginPercentage = totalCost > 0 ? (grossProfit / grandTotal) * 100 : 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Contingency:</span>
            <span>{formatCurrency(contingencyAmount)}</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center font-semibold text-base">
            <span>Grand Total:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Est. Gross Margin:</span>
            <span>{grossMarginPercentage.toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Gross Profit:</span>
            <span>{formatCurrency(grossProfit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
