
import React, { memo } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { HardHatIcon } from 'lucide-react';
import VendorSearchCombobox from './VendorSearchCombobox';

interface SubcontractorSelectorProps {
  index: number;
  subcontractors: { subid: string; subname: string }[];
  loading: boolean;
}

// Optimized subcontractor selector with memoization
const SubcontractorSelector: React.FC<SubcontractorSelectorProps> = memo(({ index, subcontractors, loading }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Function to handle value changes efficiently
  const handleSubcontractorChange = (value: string) => {
    form.setValue(`items.${index}.subcontractor_id`, value, {
      shouldDirty: true,
      shouldValidate: false
    });
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
                value={field.value || ""}
                onChange={handleSubcontractorChange}
                vendorType="subcontractor"
                placeholder={loading ? "Loading subcontractors..." : "Select subcontractor"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});

SubcontractorSelector.displayName = 'SubcontractorSelector';

export default SubcontractorSelector;
