
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { SubcontractorBasic } from '@/components/documents/vendor-selector/hooks/useVendorOptions';

interface SubcontractorSelectorProps {
  index: number;
  subcontractors: SubcontractorBasic[];
  loading: boolean;
}

const SubcontractorSelector: React.FC<SubcontractorSelectorProps> = ({ index, subcontractors, loading }) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.subcontractor_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subcontractor</FormLabel>
            <Select value={field.value || "none"} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select subcontractor"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Select subcontractor</SelectItem>
                {subcontractors.map(sub => (
                  <SelectItem key={sub.subid} value={sub.subid}>
                    {sub.subname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SubcontractorSelector;
