
import React, { useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemTypeSelectorProps {
  index: number;
}

const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Memoize the change handler to prevent re-renders
  const handleTypeChange = useCallback((value: string) => {
    // First, set the item type directly
    form.setValue(`items.${index}.item_type` as const, value, { shouldDirty: true });
    
    // Then reset related fields based on the selected type
    if (value === 'vendor') {
      form.setValue(`items.${index}.subcontractor_id` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.trade_type` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.custom_type` as const, '', { shouldDirty: true });
    } else if (value === 'subcontractor') {
      form.setValue(`items.${index}.vendor_id` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.expense_type` as const, undefined, { shouldDirty: true });
      form.setValue(`items.${index}.custom_type` as const, '', { shouldDirty: true });
    } else {
      // For labor, reset all vendor and subcontractor specific fields
      form.setValue(`items.${index}.vendor_id` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.subcontractor_id` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.trade_type` as const, '', { shouldDirty: true });
      form.setValue(`items.${index}.expense_type` as const, undefined, { shouldDirty: true });
      form.setValue(`items.${index}.custom_type` as const, '', { shouldDirty: true });
    }
  }, [form, index]);
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.item_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type*</FormLabel>
            <Select 
              value={field.value || ''} 
              onValueChange={handleTypeChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="vendor">Material (Vendor)</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default React.memo(ItemTypeSelector);
