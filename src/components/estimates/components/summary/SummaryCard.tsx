
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useSummaryCalculations } from '../../hooks/useSummaryCalculations';

const SummaryCard = () => {
  const {
    subtotal,
    totalCost,
    grandTotal,
    overallMarginPercentage,
    contingencyAmount
  } = useSummaryCalculations();
  
  // Calculate gross profit
  const grossProfit = grandTotal - totalCost;
  
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
            <span>{overallMarginPercentage.toFixed(1)}%</span>
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
