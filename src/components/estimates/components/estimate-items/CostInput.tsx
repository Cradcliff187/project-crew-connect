
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface CostInputProps {
  index: number;
}

const CostInput: React.FC<CostInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  const [localCost, setLocalCost] = useState<string>('');
  const updateTimeoutRef = useRef<number | null>(null);
  const lastFormValue = useRef<string>('');
  const isUpdatingRef = useRef(false);
  
  // Initialize local state from form with guards against loops
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    const costValue = form.getValues(`items.${index}.cost`) || '0';
    if (costValue !== localCost && costValue !== lastFormValue.current) {
      setLocalCost(costValue);
      lastFormValue.current = costValue;
    }
  }, [form, index, localCost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current !== null) {
        window.clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Handle cost changes with a stable callback and proper debouncing
  const handleCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update local state for responsive UI
    setLocalCost(newValue);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    // Create a new timeout for this update
    updateTimeoutRef.current = window.setTimeout(() => {
      if (newValue !== lastFormValue.current) {
        try {
          isUpdatingRef.current = true;
          form.setValue(`items.${index}.cost`, newValue, {
            shouldDirty: true,
            shouldValidate: false
          });
          lastFormValue.current = newValue;
        } finally {
          isUpdatingRef.current = false;
        }
      }
      updateTimeoutRef.current = null;
    }, 300);
  }, [form, index]);

  // Handle blur with immediate form update
  const handleBlur = useCallback(() => {
    // Clear pending timeout
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    // Update form immediately on blur
    if (localCost !== lastFormValue.current) {
      try {
        isUpdatingRef.current = true;
        form.setValue(`items.${index}.cost`, localCost, {
          shouldDirty: true,
          shouldValidate: true
        });
        lastFormValue.current = localCost;
      } finally {
        isUpdatingRef.current = false;
      }
    }
  }, [form, index, localCost]);
  
  return (
    <div className="col-span-12 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.cost`}
        render={() => (
          <FormItem>
            <FormLabel>Cost</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  value={localCost}
                  onChange={handleCostChange}
                  onBlur={handleBlur}
                  className="pl-6"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default React.memo(CostInput);
