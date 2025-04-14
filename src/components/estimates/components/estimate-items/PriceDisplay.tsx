import React, { useEffect } from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface PriceDisplayProps {
  index: number;
  price: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ index, price }) => {
  const form = useFormContext<EstimateFormValues>();

  // Update the unit_price field when the markup changes
  const updateUnitPrice = (index: number, newPrice: number) => {
    form.setValue(`items.${index}.unit_price`, newPrice.toString(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Ensure unit_price is kept in sync with calculations
  useEffect(() => {
    const cost = parseFloat(form.getValues(`items.${index}.cost`) || '0');
    const markupPercentage = parseFloat(form.getValues(`items.${index}.markup_percentage`) || '0');
    const markupAmount = cost * (markupPercentage / 100);
    const calculatedPrice = cost + markupAmount;

    updateUnitPrice(index, calculatedPrice);
  }, [form, index]);

  return (
    <div className="col-span-6 md:col-span-2">
      <FormItem>
        <FormLabel>Price</FormLabel>
        <div className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-right">
          ${price.toFixed(2)}
        </div>
      </FormItem>
    </div>
  );
};

export default PriceDisplay;
