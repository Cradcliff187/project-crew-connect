
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
    // Create batched updates object to minimize form re-renders
    const updates: Record<string, any> = {
      [`items.${index}.item_type`]: value
    };
    
    // Add type-specific field resets based on the selected type
    if (value === 'vendor') {
      updates[`items.${index}.subcontractor_id`] = '';
      updates[`items.${index}.trade_type`] = '';
      updates[`items.${index}.custom_type`] = '';
    } else if (value === 'subcontractor') {
      updates[`items.${index}.vendor_id`] = '';
      updates[`items.${index}.expense_type`] = undefined;
      updates[`items.${index}.custom_type`] = '';
    } else {
      // For labor, reset all vendor and subcontractor specific fields
      updates[`items.${index}.vendor_id`] = '';
      updates[`items.${index}.subcontractor_id`] = '';
      updates[`items.${index}.trade_type`] = '';
      updates[`items.${index}.expense_type`] = undefined;
      updates[`items.${index}.custom_type`] = '';
    }
    
    // Apply all updates in one batch to minimize re-renders
    Object.entries(updates).forEach(([field, value]) => {
      form.setValue(field, value, { shouldDirty: true });
    });
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
