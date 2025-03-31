
import React, { useState, useEffect } from 'react';
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
  
  // Initialize local state from form
  useEffect(() => {
    const costValue = form.watch(`items.${index}.cost`) || '0';
    setLocalCost(costValue);
  }, [form, index]);

  // Separate UI updates from form updates with debouncing
  useEffect(() => {
    if (debouncePending) {
      const handler = setTimeout(() => {
        // Only update the form if the value has actually changed
        const currentCost = form.getValues(`items.${index}.cost`);
        if (currentCost !== localCost) {
          form.setValue(`items.${index}.cost`, localCost, {
            shouldDirty: true,
            shouldValidate: false
          });
        }
        setDebouncePending(false);
      }, 300);
      
      return () => clearTimeout(handler);
    }
  }, [localCost, debouncePending, form, index]);

  // Handle local changes
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update local state immediately for responsive UI
    setLocalCost(value);
    // Mark for debounced form update
    setDebouncePending(true);
  };

  // Handle blur event to ensure form is updated
  const handleBlur = () => {
    // Force immediate update on blur
    if (debouncePending) {
      form.setValue(`items.${index}.cost`, localCost, {
        shouldDirty: true,
        shouldValidate: true
      });
      setDebouncePending(false);
    }
  };
  
  return (
    <div className="col-span-12 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.cost`}
        render={({ field }) => (
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
