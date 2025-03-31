
import React, { useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { SubcontractorBasic } from '@/components/documents/vendor-selector/hooks/useVendorOptions';
import { Badge } from '@/components/ui/badge';
import { HardHatIcon } from 'lucide-react';

interface SubcontractorSelectorProps {
  index: number;
  subcontractors: SubcontractorBasic[];
  loading: boolean;
}

const SubcontractorSelector: React.FC<SubcontractorSelectorProps> = ({ index, subcontractors, loading }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Optimize value change handler with useCallback
  const handleValueChange = useCallback((value: string) => {
    // Use a direct value check instead of an equality comparison for better stability
    const finalValue = value === "none" ? "" : value;
    
    // Use setValue with minimal options to reduce re-renders
    form.setValue(`items.${index}.subcontractor_id`, finalValue, { 
      shouldDirty: true,
      shouldValidate: false, // Don't validate on change to reduce calculations
    });
  }, [form, index]);
  
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
            <Select value={field.value || "none"} onValueChange={handleValueChange}>
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

export default React.memo(SubcontractorSelector);
