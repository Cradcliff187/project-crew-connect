
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface MarkupInputProps {
  index: number;
}

const MarkupInput: React.FC<MarkupInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  const [localMarkup, setLocalMarkup] = useState<string>('');
  const debouncePending = useRef(false);
  const lastFormValue = useRef<string>('');
  const updateTimeoutRef = useRef<number | null>(null);
  
  // Initialize form values
  useEffect(() => {
    const markupValue = form.getValues(`items.${index}.markup_percentage`) || '0';
    if (markupValue !== localMarkup && markupValue !== lastFormValue.current) {
      setLocalMarkup(markupValue);
      lastFormValue.current = markupValue;
    }
  }, [form, index, localMarkup]);

  // Implement debounced update with proper cleanup
  useEffect(() => {
    return () => {
      // Clear timeout on unmount
      if (updateTimeoutRef.current !== null) {
        window.clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle change with a stable reference
  const handleMarkupChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update local state immediately for responsive UI
    setLocalMarkup(newValue);
    
    // Clear any pending timeout
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout for debounced update
    debouncePending.current = true;
    updateTimeoutRef.current = window.setTimeout(() => {
      // Only update if value changed and component is still mounted
      if (newValue !== lastFormValue.current) {
        form.setValue(`items.${index}.markup_percentage`, newValue, {
          shouldDirty: true,
          shouldValidate: false
        });
        lastFormValue.current = newValue;
      }
      debouncePending.current = false;
      updateTimeoutRef.current = null;
    }, 300);
  }, [form, index]);

  // Handle blur with immediate update
  const handleBlur = useCallback(() => {
    // Clear pending timeout if exists
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    // Update immediately on blur if needed
    if (debouncePending.current || localMarkup !== lastFormValue.current) {
      form.setValue(`items.${index}.markup_percentage`, localMarkup, {
        shouldDirty: true,
        shouldValidate: true
      });
      lastFormValue.current = localMarkup;
      debouncePending.current = false;
    }
  }, [form, index, localMarkup]);
  
  return (
    <div className="col-span-12 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.markup_percentage`}
        render={() => (
          <FormItem>
            <FormLabel>Markup %</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  value={localMarkup}
                  onChange={handleMarkupChange}
                  onBlur={handleBlur}
                  className="pr-8"
                  type="number"
                  min="0"
                  step="1"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default React.memo(MarkupInput);
