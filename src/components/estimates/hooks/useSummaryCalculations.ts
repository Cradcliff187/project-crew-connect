
import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
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
    defaultValue: [] as EstimateItem[]
  });

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Increase debounce time to reduce calculation frequency
  const debouncedItems = useDebounce(items, 600);
  const debouncedContingencyPercentage = useDebounce(contingencyPercentage, 600);

  // Memoized function to normalize items for calculation
  const normalizeCalculationItems = useCallback((items: EstimateItem[]): EstimateItem[] => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item: EstimateItem) => ({
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
  }, []);

  // Use memoization for calculation items to prevent recreation on each render
  const calculationItems = useMemo(() => 
    normalizeCalculationItems(debouncedItems), 
    [debouncedItems, normalizeCalculationItems]
  );

  // Cache the last calculated values to prevent recalculations when inputs haven't changed
  // This optimization is particularly helpful for complex calculations
  // Use memoization to calculate values only when the debounced inputs change
  const calculations = useMemo(() => {
    // Add performance tracking for development
    const perfStart = performance.now();
    
    // Calculate all the totals
    const totalCost = calculateTotalCost(calculationItems);
    const totalMarkup = calculateTotalMarkup(calculationItems);
    const subtotal = calculateSubtotal(calculationItems);
    const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
    const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
    const contingencyAmount = calculateContingencyAmount(calculationItems, debouncedContingencyPercentage);
    const grandTotal = calculateGrandTotal(calculationItems, debouncedContingencyPercentage);

    // Log performance in development only
    if (process.env.NODE_ENV === 'development') {
      const perfEnd = performance.now();
      if (perfEnd - perfStart > 50) {  // Only log if calculations take more than 50ms
        console.debug(`Summary calculations took ${(perfEnd - perfStart).toFixed(2)}ms`);
      }
    }

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
