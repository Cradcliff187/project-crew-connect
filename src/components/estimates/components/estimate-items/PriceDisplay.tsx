
import React from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';

interface PriceDisplayProps {
  price: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price }) => {
  return (
    <div className="col-span-6 md:col-span-2">
      <FormItem>
        <FormLabel>Price</FormLabel>
        <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
          ${price.toFixed(2)}
        </div>
      </FormItem>
    </div>
  );
};

export default PriceDisplay;
