import React from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';

interface MarginDisplayProps {
  grossMargin: number;
  grossMarginPercentage: number;
}

const MarginDisplay: React.FC<MarginDisplayProps> = ({ grossMargin, grossMarginPercentage }) => {
  return (
    <div className="col-span-6 md:col-span-2">
      <FormItem>
        <FormLabel>Gross Margin</FormLabel>
        <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
          ${grossMargin.toFixed(2)} ({grossMarginPercentage.toFixed(1)}%)
        </div>
      </FormItem>
    </div>
  );
};

export default MarginDisplay;
