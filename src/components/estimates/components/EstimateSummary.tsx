
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import SummaryCard from './summary/SummaryCard';
import CopyTotalButton from './summary/CopyTotalButton';
import { 
  calculateSubtotal, 
  calculateContingencyAmount, 
  calculateGrandTotal,
  calculateTotalCost,
  calculateTotalMarkup,
  calculateTotalGrossMargin,
  calculateOverallGrossMarginPercentage
} from '../utils/estimateCalculations';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';

const EstimateSummary = () => {
  const form = useFormContext<EstimateFormValues>();
  const items = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: []
  });

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Convert items to the expected type for calculations
  const calculationItems: EstimateItem[] = items.map((item: any) => ({
    cost: item.cost || '0',
    markup_percentage: item.markup_percentage || '0',
    quantity: item.quantity || '1',
    item_type: item.item_type
  }));

  // Calculate all the totals
  const totalCost = calculateTotalCost(calculationItems);
  const totalMarkup = calculateTotalMarkup(calculationItems);
  const subtotal = calculateSubtotal(calculationItems);
  const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
  const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
  const contingencyAmount = calculateContingencyAmount(calculationItems, contingencyPercentage);
  const grandTotal = calculateGrandTotal(calculationItems, contingencyPercentage);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Estimate Summary</h3>
      
      <SummaryCard
        control={form.control}
        totalCost={totalCost}
        totalMarkup={totalMarkup}
        subtotal={subtotal}
        totalGrossMargin={totalGrossMargin}
        overallMarginPercentage={overallMarginPercentage}
        contingencyAmount={contingencyAmount}
        grandTotal={grandTotal}
      />
      
      <CopyTotalButton grandTotal={grandTotal} />
    </div>
  );
};

export default EstimateSummary;
