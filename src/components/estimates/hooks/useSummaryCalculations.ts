
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
  
  // Optimize the watch to be more specific and prevent re-render loops
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

  // Add debugging for excessive calculations
  useEffect(() => {
    calculationCount.current++;
    const now = Date.now();
    const timeSinceLastCalc = now - lastCalculationTime.current;
    
    if (timeSinceLastCalc < 100 && calculationCount.current > 5) {
      console.warn(`Frequent recalculations detected in useSummaryCalculations, ${calculationCount.current} calcs in ${timeSinceLastCalc}ms`);
    }
    
    lastCalculationTime.current = now;
  }, [items, contingencyPercentage]);

  // Transform items and perform calculations with memoization to prevent unnecessary recalculations
  const calculationItems: EstimateItem[] = useMemo(() => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item: any) => ({
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
  }, [items]);

  // Memoize all calculations with a dependency array that only includes what's actually needed
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
