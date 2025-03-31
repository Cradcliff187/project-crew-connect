
import React, { useState, useEffect } from 'react';
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
  const [debouncePending, setDebouncePending] = useState(false);
  
  // Initialize local state from form
  useEffect(() => {
    const markupValue = form.watch(`items.${index}.markup_percentage`) || '0';
    setLocalMarkup(markupValue);
  }, [form, index]);

  // Separate UI updates from form updates with debouncing
  useEffect(() => {
    if (debouncePending) {
      const handler = setTimeout(() => {
        // Only update the form if the value has actually changed
        const currentMarkup = form.getValues(`items.${index}.markup_percentage`);
        if (currentMarkup !== localMarkup) {
          form.setValue(`items.${index}.markup_percentage`, localMarkup, {
            shouldDirty: true,
            shouldValidate: false
          });
        }
        setDebouncePending(false);
      }, 300);
      
      return () => clearTimeout(handler);
    }
  }, [localMarkup, debouncePending, form, index]);

  // Handle local changes
  const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update local state immediately for responsive UI
    setLocalMarkup(value);
    // Mark for debounced form update
    setDebouncePending(true);
  };

  // Handle blur event to ensure form is updated
  const handleBlur = () => {
    // Force immediate update on blur
    if (debouncePending) {
      form.setValue(`items.${index}.markup_percentage`, localMarkup, {
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
        name={`items.${index}.markup_percentage`}
        render={({ field }) => (
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
