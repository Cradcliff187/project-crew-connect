
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SummaryRow from './SummaryRow';
import ContingencyField from './ContingencyField';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface SummaryCardProps {
  control: Control<EstimateFormValues>;
  totalCost: number;
  totalMarkup: number;
  subtotal: number;
  totalGrossMargin: number;
  overallMarginPercentage: number;
  contingencyAmount: number;
  grandTotal: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  control,
  totalCost,
  totalMarkup,
  subtotal,
  totalGrossMargin,
  overallMarginPercentage,
  contingencyAmount,
  grandTotal
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <SummaryRow 
            label="Total Cost:" 
            value={`$${totalCost.toFixed(2)}`} 
          />
          
          <SummaryRow 
            label="Total Markup:" 
            value={`$${totalMarkup.toFixed(2)}`} 
          />
          
          <SummaryRow 
            label="Subtotal (Price):" 
            value={`$${subtotal.toFixed(2)}`} 
          />
          
          <SummaryRow 
            label="Gross Margin:" 
            value={`$${totalGrossMargin.toFixed(2)} (${overallMarginPercentage.toFixed(1)}%)`} 
          />
          
          <ContingencyField 
            control={control} 
            contingencyAmount={contingencyAmount} 
          />
          
          <SummaryRow 
            label="Grand Total:" 
            value={`$${grandTotal.toFixed(2)}`} 
            isBold={true}
            hasBorder={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
