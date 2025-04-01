
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import SummaryCard from './summary/SummaryCard';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';

const EstimateSummary = () => {
  const { contingencyAmount } = useSummaryCalculations();
  
  return <SummaryCard contingencyAmount={contingencyAmount} />;
};

export default EstimateSummary;
