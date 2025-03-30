
import { useFormContext, useWatch } from 'react-hook-form';
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

export const useSummaryCalculations = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Fix for error #1: Provide a valid default value for items that matches the expected type
  const items = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }]
  });

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Fix for error #2: Ensure items is treated as an array and handle it safely
  const calculationItems: EstimateItem[] = Array.isArray(items) 
    ? items.map((item: any) => ({
        cost: item.cost || '0',
        markup_percentage: item.markup_percentage || '0',
        quantity: item.quantity || '1',
        item_type: item.item_type
      })) 
    : [];

  // Calculate all the totals
  const totalCost = calculateTotalCost(calculationItems);
  const totalMarkup = calculateTotalMarkup(calculationItems);
  const subtotal = calculateSubtotal(calculationItems);
  const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
  const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
  const contingencyAmount = calculateContingencyAmount(calculationItems, contingencyPercentage);
  const grandTotal = calculateGrandTotal(calculationItems, contingencyPercentage);

  return {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  };
};
