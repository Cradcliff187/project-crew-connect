
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
import { useDebounce } from '@/hooks/useDebounce';

interface EstimateFormValues {
  items: any[];
  contingency_percentage: string;
  // ... other form fields
}

export const useSummaryCalculations = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Use useWatch for more efficient watching of form values
  const items = useWatch({
    control: form.control,
    name: 'items',
  }) || [];

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Increase debounce time to reduce calculation frequency
  const debouncedItems = useDebounce(items, 600);
  const debouncedContingencyPercentage = useDebounce(contingencyPercentage, 600);

  // Memoized function to normalize items for calculation
  const normalizeCalculationItems = useCallback((formItems: any[]): any[] => {
    if (!Array.isArray(formItems)) return [];
    
    return formItems.map((item) => ({
      cost: item?.cost || '0',
      markup_percentage: item?.markup_percentage || '0',
      quantity: item?.quantity || '1',
      unit_price: item?.unit_price || '0',
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
  const calculations = useMemo(() => {
    // Add performance tracking for development
    const perfStart = performance.now();
    
    try {
      // Calculate all the totals
      const totalCost = calculateTotalCost(calculationItems);
      const totalMarkup = calculateTotalMarkup(calculationItems);
      const subtotal = calculateSubtotal(calculationItems);
      const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
      const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
      const contingencyAmount = calculateContingencyAmount(calculationItems, debouncedContingencyPercentage);
      const grandTotal = calculateGrandTotal(subtotal, contingencyAmount);
  
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
        grandTotal,
        hasError: false,
        errorMessage: ""
      };
    } catch (error: any) {
      console.error("Error in estimate calculations:", error);
      return {
        totalCost: 0,
        totalMarkup: 0,
        subtotal: 0, 
        totalGrossMargin: 0,
        overallMarginPercentage: 0,
        contingencyAmount: 0,
        grandTotal: 0,
        hasError: true,
        errorMessage: error.message || "Error calculating totals"
      };
    }
  }, [calculationItems, debouncedContingencyPercentage]);

  return calculations;
};

export default useSummaryCalculations;
