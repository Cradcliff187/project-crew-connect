import React, { memo, useState, useEffect, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { HardHatIcon } from 'lucide-react';
import VendorSearchCombobox from './VendorSearchCombobox';

interface SubcontractorSelectorProps {
  index: number;
  subcontractors: { subid: string; company_name: string | null; contact_name?: string | null }[];
  loading: boolean;
}

// Optimized subcontractor selector with memoization and lazy loading
const SubcontractorSelector = memo(
  ({ index, subcontractors, loading }: SubcontractorSelectorProps) => {
    const form = useFormContext<EstimateFormValues>();
    const currentValue = form.watch(`items.${index}.subcontractor_id`);
    const previousValueRef = useRef(currentValue);
    const [isDirty, setIsDirty] = useState(false);

    // Only update the ref when the value actually changes
    useEffect(() => {
      if (currentValue !== previousValueRef.current) {
        previousValueRef.current = currentValue;
        setIsDirty(true);
      }
    }, [currentValue]);

    // Function to handle value changes efficiently with minimal form updates
    const handleSubcontractorChange = (value: string) => {
      if (value === form.getValues(`items.${index}.subcontractor_id`)) return;

      form.setValue(`items.${index}.subcontractor_id`, value, {
        shouldDirty: true,
        shouldValidate: false, // Prevent validation on each change
        shouldTouch: false, // Don't mark as touched to reduce rerenders
      });

      setIsDirty(true);
    };

    return (
      <div className="col-span-12 md:col-span-3">
        <FormField
          control={form.control}
          name={`items.${index}.subcontractor_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <HardHatIcon className="h-3.5 w-3.5 text-[#0485ea]" />
                <span>Subcontractor</span>
                {subcontractors.length > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
                    {subcontractors.length}
                  </Badge>
                )}
              </FormLabel>
              <FormControl>
                <VendorSearchCombobox
                  value={field.value || ''}
                  onChange={handleSubcontractorChange}
                  vendorType="subcontractor"
                  placeholder={loading ? 'Loading subcontractors...' : 'Select subcontractor'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
);

SubcontractorSelector.displayName = 'SubcontractorSelector';

export default SubcontractorSelector;
