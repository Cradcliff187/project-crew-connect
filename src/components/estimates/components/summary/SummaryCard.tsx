
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface SummaryCardProps {
  contingencyAmount?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ contingencyAmount = 0 }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Calculate totals
  const items = form.watch('items') || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const cost = parseFloat(item.cost) || 0;
    const markup = parseFloat(item.markup_percentage) || 0;
    const markupAmount = cost * (markup / 100);
    const quantity = parseFloat(item.quantity) || 1;
    return sum + ((cost + markupAmount) * quantity);
  }, 0);
  
  const total = subtotal + contingencyAmount;
  
  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold mb-4">Estimate Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contingency:</span>
            <span>${contingencyAmount.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
