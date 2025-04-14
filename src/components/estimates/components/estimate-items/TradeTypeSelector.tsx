import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import useSpecialties from '@/components/subcontractors/hooks/useSpecialties';

interface TradeTypeSelectorProps {
  index: number;
}

const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  const { specialties, loading } = useSpecialties();
  const [showCustomInput, setShowCustomInput] = useState(false);

  const tradeType = form.watch(`items.${index}.trade_type`);

  // Handle specialty selection
  useEffect(() => {
    if (tradeType === 'other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      // Clear custom type if a specific trade type is selected
      form.setValue(`items.${index}.custom_type`, '');
    }
  }, [tradeType, form, index]);

  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.trade_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trade Type</FormLabel>
            <Select value={field.value || 'none'} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? 'Loading...' : 'Select trade'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Select trade</SelectItem>
                {Object.values(specialties).map(specialty => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.specialty}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showCustomInput && (
        <FormField
          control={form.control}
          name={`items.${index}.custom_type`}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Custom Trade</FormLabel>
              <FormControl>
                <Input placeholder="Enter custom trade type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default TradeTypeSelector;
