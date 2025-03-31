
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
  
  console.log('Form values in useSummaryCalculations:', form.getValues());
  
  // Fix for error #1: Provide a valid default value for items that matches the expected type
  const items = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }]
  });

  console.log('Items from useWatch:', items);

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  console.log('Contingency percentage:', contingencyPercentage);

  // Fix for error #2: Ensure items is treated as an array and handle it safely
  const calculationItems: EstimateItem[] = Array.isArray(items) 
    ? items.map((item: any) => {
        console.log('Processing item for calculation:', item);
        return {
          cost: item?.cost || '0',
          markup_percentage: item?.markup_percentage || '0',
          quantity: item?.quantity || '1',
          item_type: item?.item_type,
          vendor_id: item?.vendor_id,
          subcontractor_id: item?.subcontractor_id,
          document_id: item?.document_id,
          trade_type: item?.trade_type,
          expense_type: item?.expense_type,
          custom_type: item?.custom_type
        };
      }) 
    : [];

  console.log('Transformed calculation items:', calculationItems);

  // Calculate all the totals
  const totalCost = calculateTotalCost(calculationItems);
  const totalMarkup = calculateTotalMarkup(calculationItems);
  const subtotal = calculateSubtotal(calculationItems);
  const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
  const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
  const contingencyAmount = calculateContingencyAmount(calculationItems, contingencyPercentage);
  const grandTotal = calculateGrandTotal(calculationItems, contingencyPercentage);

  console.log('Calculation results:', {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  });

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
