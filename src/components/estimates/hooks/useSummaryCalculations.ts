
import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
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
import { useDebounce } from '@/hooks/useDebounce';

export const useSummaryCalculations = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Use useWatch for more efficient watching of form values
  // This prevents unnecessary recalculation on every render
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

  // Debounce values to reduce calculation frequency
  const debouncedItems = useDebounce(items, 300);
  const debouncedContingencyPercentage = useDebounce(contingencyPercentage, 300);

  // Use useMemo to prevent recalculation if the inputs haven't changed
  const calculationItems: EstimateItem[] = useMemo(() => {
    if (!Array.isArray(debouncedItems)) return [];
    
    return debouncedItems.map((item: any) => ({
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
    }));
  }, [debouncedItems]);

  // Use memoization to calculate values only when the debounced inputs change
  const calculations = useMemo(() => {
    // Calculate all the totals
    const totalCost = calculateTotalCost(calculationItems);
    const totalMarkup = calculateTotalMarkup(calculationItems);
    const subtotal = calculateSubtotal(calculationItems);
    const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
    const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
    const contingencyAmount = calculateContingencyAmount(calculationItems, debouncedContingencyPercentage);
    const grandTotal = calculateGrandTotal(calculationItems, debouncedContingencyPercentage);

    return {
      totalCost,
      totalMarkup,
      subtotal,
      totalGrossMargin,
      overallMarginPercentage,
      contingencyAmount,
      grandTotal
    };
  }, [calculationItems, debouncedContingencyPercentage]);

  return calculations;
};
