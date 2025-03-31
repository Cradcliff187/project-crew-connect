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
  
  // Optimize the watch to be more specific and prevent re-render loops
  // Provide a default value that meets the TypeScript requirements
  const items = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: [{ 
      description: '', 
      quantity: '1', 
      unitPrice: '0', 
      cost: '0', 
      markup_percentage: '0' 
    }]
  });

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Enhanced debugging for excessive calculations
  useEffect(() => {
    calculationCount.current++;
    const now = Date.now();
    const timeSinceLastCalc = now - lastCalculationTime.current;
    
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
        `- Items array length: ${items?.length || 0}`
      );
    }
    
    lastCalculationTime.current = now;
  }, [items, contingencyPercentage]);

  // Transform items with more robust null/undefined handling
  const calculationItems: EstimateItem[] = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return [{ 
        cost: '0',
        markup_percentage: '0',
        quantity: '1'
      }];
    }
    
    return items.map((item: any) => ({
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
  }, [items]);

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
