
import React, { useState, useEffect, useCallback, memo } from 'react';
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
  const [debouncePending, setDebouncePending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  // Initialize local state from form
  useEffect(() => {
    const costValue = form.getValues(`items.${index}.cost`) || '0';
    if (costValue !== localCost) {
      setLocalCost(costValue);
    }
  }, [form, index]);

  // Debounce form updates with a stable timer reference
  useEffect(() => {
    if (debouncePending && (Date.now() - lastUpdated > 200)) {
      const handler = setTimeout(() => {
        // Only update if value has changed to prevent loops
        const currentCost = form.getValues(`items.${index}.cost`);
        if (currentCost !== localCost) {
          form.setValue(`items.${index}.cost`, localCost, {
            shouldDirty: true,
            shouldValidate: false
          });
          setLastUpdated(Date.now());
        }
        setDebouncePending(false);
      }, 300);
      
      return () => clearTimeout(handler);
    }
  }, [localCost, debouncePending, form, index, lastUpdated]);

  // Use a stable callback for cost changes
  const handleCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalCost(value);
    setDebouncePending(true);
  }, []);

  // Handle blur event with a stable callback
  const handleBlur = useCallback(() => {
    if (debouncePending) {
      form.setValue(`items.${index}.cost`, localCost, {
        shouldDirty: true,
        shouldValidate: true
      });
      setDebouncePending(false);
      setLastUpdated(Date.now());
    }
  }, [debouncePending, form, index, localCost]);
  
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

// Use React.memo to prevent unnecessary re-renders
export default memo(CostInput);
