
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
    // Batch state updates to prevent multiple re-renders
    form.setValue(`items.${index}.item_type`, value, { shouldDirty: true });
    
    // Reset type-specific fields when type changes
    if (value === 'vendor') {
      form.setValue(`items.${index}.subcontractor_id`, '', { shouldDirty: true });
      form.setValue(`items.${index}.trade_type`, '', { shouldDirty: true });
      form.setValue(`items.${index}.custom_type`, '', { shouldDirty: true });
    } else if (value === 'subcontractor') {
      form.setValue(`items.${index}.vendor_id`, '', { shouldDirty: true });
      form.setValue(`items.${index}.expense_type`, undefined, { shouldDirty: true });
      form.setValue(`items.${index}.custom_type`, '', { shouldDirty: true });
    } else {
      // For labor, reset all vendor and subcontractor specific fields
      form.setValue(`items.${index}.vendor_id`, '', { shouldDirty: true });
      form.setValue(`items.${index}.subcontractor_id`, '', { shouldDirty: true });
      form.setValue(`items.${index}.trade_type`, '', { shouldDirty: true });
      form.setValue(`items.${index}.expense_type`, undefined, { shouldDirty: true });
      form.setValue(`items.${index}.custom_type`, '', { shouldDirty: true });
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
