
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                // Reset vendor/subcontractor when type changes
                if (value === 'vendor') {
                  form.setValue(`items.${index}.subcontractor_id`, '');
                } else if (value === 'subcontractor') {
                  form.setValue(`items.${index}.vendor_id`, '');
                } else {
                  form.setValue(`items.${index}.vendor_id`, '');
                  form.setValue(`items.${index}.subcontractor_id`, '');
                }
              }}
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

export default ItemTypeSelector;
