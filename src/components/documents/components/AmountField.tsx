import React, { useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface AmountFieldProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  prefillAmount?: number;
}

const AmountField: React.FC<AmountFieldProps> = ({
  control,
  isReceiptUpload = false,
  prefillAmount,
}) => {
  return (
    <FormField
      control={control}
      name="metadata.amount"
      render={({ field }) => {
        // Handle the number conversion for the amount field
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          field.onChange(value === '' ? undefined : parseFloat(value));
        };

        // Use the prefillAmount if provided and not already set
        useEffect(() => {
          if (prefillAmount !== undefined && !field.value) {
            field.onChange(prefillAmount);
          }
        }, [prefillAmount]);

        return (
          <FormItem>
            <FormLabel>Amount ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                onChange={handleChange}
                value={field.value === undefined ? '' : field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default AmountField;
