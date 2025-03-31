
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SummaryItem from './SummaryItem';
import ContingencyInput from './ContingencyInput';

interface SummaryCardProps {
  totalCost: number;
  totalMarkup: number;
  subtotal: number;
  totalGrossMargin: number;
  overallMarginPercentage: number;
  contingencyAmount: number;
  grandTotal: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  totalCost,
  totalMarkup,
  subtotal,
  totalGrossMargin,
  overallMarginPercentage,
  contingencyAmount,
  grandTotal
}) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <SummaryItem 
            label="Total Cost" 
            value={`$${totalCost.toFixed(2)}`} 
          />
          
          <SummaryItem 
            label="Total Markup" 
            value={`$${totalMarkup.toFixed(2)}`} 
          />
          
          <SummaryItem 
            label="Subtotal (Price)" 
            value={`$${subtotal.toFixed(2)}`} 
          />
          
          <SummaryItem 
            label="Gross Margin" 
            value={`$${totalGrossMargin.toFixed(2)} (${overallMarginPercentage.toFixed(1)}%)`} 
          />
          
          <ContingencyInput contingencyAmount={contingencyAmount} />
          
          <SummaryItem 
            label="Grand Total" 
            value={`$${grandTotal.toFixed(2)}`}
            isBold={true}
            hasBorderTop={true} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
