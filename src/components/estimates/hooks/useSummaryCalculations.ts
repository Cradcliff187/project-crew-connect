
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
import { useMemo, useRef, useEffect } from 'react';

export const useSummaryCalculations = () => {
  const form = useFormContext<EstimateFormValues>();
  const calculationCount = useRef(0);
  const lastCalculationTime = useRef(Date.now());
  const calculationIntervals = useRef<number[]>([]);
  const skippedCalculation = useRef(false);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Use a more restrictive watch to prevent re-render loops
  // Only watch the specific fields needed for calculations
  const itemsArray = useWatch({
    control: form.control,
    name: 'items',
    // Fix: Use a default value that matches the expected type (at least one item)
    defaultValue: [{ 
      description: '',
      cost: '0',
      markup_percentage: '0',
      quantity: '1'
    }]
  });
  
  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Transform items with more robust null/undefined handling - memoized to prevent recalculations
  const calculationItems: EstimateItem[] = useMemo(() => {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
      return [{ 
        cost: '0',
        markup_percentage: '0',
        quantity: '1'
      }];
    }
    
    return itemsArray.map((item: any) => ({
      cost: item?.cost || '0',
      markup_percentage: item?.markup_percentage || '0',
      quantity: item?.quantity || '1',
      // Keep optional fields if they exist
      item_type: item?.item_type,
      vendor_id: item?.vendor_id,
      subcontractor_id: item?.subcontractor_id,
      document_id: item?.document_id,
      trade_type: item?.trade_type,
      expense_type: item?.expense_type,
      custom_type: item?.custom_type
    }));
  }, [itemsArray]);

  // Enhanced debugging and throttling for calculations
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCalc = now - lastCalculationTime.current;
    
    // If calculations are happening too frequently, skip some
    if (timeSinceLastCalc < 50) {
      if (!skippedCalculation.current) {
        skippedCalculation.current = true;
        return; // Skip this calculation cycle
      }
    }
    
    // Reset skipped flag
    skippedCalculation.current = false;
    
    // Throttle calculations
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }
    
    throttleTimeout.current = setTimeout(() => {
      calculationCount.current++;
      lastCalculationTime.current = now;
      
      // Track time intervals between calculations
      calculationIntervals.current.push(timeSinceLastCalc);
      if (calculationIntervals.current.length > 20) {
        calculationIntervals.current.shift();
      }
      
      // Detect frequent recalculations and provide more detailed debugging
      if (timeSinceLastCalc < 100 && calculationCount.current > 5) {
        const averageInterval = calculationIntervals.current.reduce((sum, interval) => sum + interval, 0) / 
          calculationIntervals.current.length;
        
        console.warn(
          `Frequent recalculations detected in useSummaryCalculations:\n` +
          `- ${calculationCount.current} calculations total\n` +
          `- Last interval: ${timeSinceLastCalc}ms\n` +
          `- Average interval: ${averageInterval.toFixed(2)}ms\n` +
          `- Items array length: ${calculationItems?.length || 0}`
        );
      }
    }, 50);
    
    // Clean up on unmount
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [calculationItems, contingencyPercentage]);

  // Memoize all calculations with proper dependencies
  const calculations = useMemo(() => {
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
  }, [calculationItems, contingencyPercentage]);

  return calculations;
};
