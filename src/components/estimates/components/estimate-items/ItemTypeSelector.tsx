import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemTypeSelectorProps {
  index: number;
}

const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();

  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.item_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type*</FormLabel>
            <Select
              value={field.value || 'none'}
              onValueChange={value => {
                field.onChange(value === 'none' ? null : value);
                // Reset type-specific fields when type changes
                if (value === 'vendor') {
                  form.setValue(`items.${index}.subcontractor_id`, '');
                  form.setValue(`items.${index}.trade_type`, '');
                  form.setValue(`items.${index}.custom_type`, '');
                } else if (value === 'subcontractor') {
                  form.setValue(`items.${index}.vendor_id`, '');
                  form.setValue(`items.${index}.expense_type`, undefined);
                  form.setValue(`items.${index}.custom_type`, '');
                } else if (value !== 'none') {
                  // For labor, reset all vendor and subcontractor specific fields
                  form.setValue(`items.${index}.vendor_id`, '');
                  form.setValue(`items.${index}.subcontractor_id`, '');
                  form.setValue(`items.${index}.trade_type`, '');
                  form.setValue(`items.${index}.expense_type`, undefined);
                  form.setValue(`items.${index}.custom_type`, '');
                }
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Choose item type</SelectItem>
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

export default ItemTypeSelector;
