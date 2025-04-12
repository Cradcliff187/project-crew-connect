
import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
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

interface CalculationResults {
  totalCost: number;
  totalMarkup: number;
  subtotal: number;
  totalGrossMargin: number;
  overallMarginPercentage: number;
  contingencyAmount: number;
  grandTotal: number;
  hasError: boolean;
  errorMessage: string;
}

export const useSummaryCalculations = () => {
  const form = useFormContext<EstimateFormValues>();
  const calculationLockRef = useRef(false);
  const lastCalculationTimeRef = useRef(0);
  const [calculationResults, setCalculationResults] = useState<CalculationResults>({
    totalCost: 0,
    totalMarkup: 0,
    subtotal: 0,
    totalGrossMargin: 0,
    overallMarginPercentage: 0,
    contingencyAmount: 0,
    grandTotal: 0,
    hasError: false,
    errorMessage: ""
  });
  
  // Use useWatch with selective dependencies instead of watching the entire form
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

  // Increase debounce time to reduce calculation frequency
  const debouncedItems = useDebounce(items, 800);
  const debouncedContingencyPercentage = useDebounce(contingencyPercentage, 800);
  
  // Normalize calculation items - memoized to prevent recreation
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
  
  // Effect for calculation with rate limiting
  useEffect(() => {
    // Skip calculation if we're in a lock period
    if (calculationLockRef.current) return;
    
    // Rate limit to max one calculation per 500ms
    const now = Date.now();
    if (now - lastCalculationTimeRef.current < 500) {
      const timeToWait = 500 - (now - lastCalculationTimeRef.current);
      const timeout = setTimeout(() => {
        // Set lock during calculation to prevent recursive updates
        calculationLockRef.current = true;
        performCalculation();
        calculationLockRef.current = false;
      }, timeToWait);
      return () => clearTimeout(timeout);
    }
    
    // Set lock during calculation to prevent recursive updates
    calculationLockRef.current = true;
    performCalculation();
    calculationLockRef.current = false;
  }, [debouncedItems, debouncedContingencyPercentage]);
  
  const performCalculation = () => {
    try {
      // Record calculation time
      lastCalculationTimeRef.current = Date.now();
      
      // Use normalized items
      const calculationItems = normalizeCalculationItems(debouncedItems);
      
      // Calculate all the totals
      const totalCost = calculateTotalCost(calculationItems);
      const totalMarkup = calculateTotalMarkup(calculationItems);
      const subtotal = calculateSubtotal(calculationItems);
      const totalGrossMargin = calculateTotalGrossMargin(calculationItems);
      const overallMarginPercentage = calculateOverallGrossMarginPercentage(calculationItems);
      const contingencyAmount = calculateContingencyAmount(calculationItems, debouncedContingencyPercentage);
      const grandTotal = calculateGrandTotal(subtotal, contingencyAmount);
      
      // Update state with new values
      setCalculationResults({
        totalCost,
        totalMarkup,
        subtotal,
        totalGrossMargin,
        overallMarginPercentage,
        contingencyAmount,
        grandTotal,
        hasError: false,
        errorMessage: ""
      });
    } catch (error: any) {
      console.error("Error in estimate calculations:", error);
      setCalculationResults(prev => ({
        ...prev,
        hasError: true,
        errorMessage: error.message || "Error calculating totals"
      }));
    }
  };

  return calculationResults;
};

export default useSummaryCalculations;
