
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemTypeSelectorProps {
  control: Control<EstimateFormValues>;
  index: number;
  onTypeChange: (value: string) => void;
}

const ItemTypeSelector = ({ control, index, onTypeChange }: ItemTypeSelectorProps) => {
  return (
    <FormField
      control={control}
      name={`items.${index}.item_type`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type*</FormLabel>
          <Select 
            value={field.value} 
            onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value);
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
  );
};

export default ItemTypeSelector;
