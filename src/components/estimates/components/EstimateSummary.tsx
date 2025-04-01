
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import SummaryCard from './summary/SummaryCard';

const EstimateSummary = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Calculate contingency amount
  const items = form.watch('items') || [];
  const totalBeforeContingency = items.reduce((sum: number, item: EstimateItem) => {
    const cost = parseFloat(item.cost || '0');
    const markup = parseFloat(item.markup_percentage || '0');
    const markupAmount = cost * (markup / 100);
    const quantity = parseFloat(item.quantity || '1');
    return sum + ((cost + markupAmount) * quantity);
  }, 0);
  
  const contingencyPercentage = parseFloat(form.watch('contingency_percentage') || '0');
  const contingencyAmount = totalBeforeContingency * (contingencyPercentage / 100);
  
  return <SummaryCard contingencyAmount={contingencyAmount} />;
};

export default EstimateSummary;
