
import React from 'react';
import SummaryCard from './summary/SummaryCard';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';

const EstimateSummary = () => {
  const {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  } = useSummaryCalculations();

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Estimate Summary</h3>
      
      <SummaryCard 
        totalCost={totalCost}
        totalMarkup={totalMarkup}
        subtotal={subtotal}
        totalGrossMargin={totalGrossMargin}
        overallMarginPercentage={overallMarginPercentage}
        contingencyAmount={contingencyAmount}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default EstimateSummary;
