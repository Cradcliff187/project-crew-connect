
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
