
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { calculateSubtotal, calculateContingencyAmount, calculateGrandTotal } from '../utils/estimateCalculations';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';

const EstimateSummary = () => {
  const form = useFormContext<EstimateFormValues>();
  const items = useWatch({
    control: form.control,
    name: 'items',
    defaultValue: []
  });

  const contingencyPercentage = useWatch({
    control: form.control,
    name: 'contingency_percentage',
    defaultValue: "0"
  });

  // Convert items to the expected type for calculations
  const calculationItems: EstimateItem[] = items.map((item: any) => ({
    quantity: item.quantity || '0',
    unitPrice: item.unitPrice || '0'
  }));

  const subtotal = calculateSubtotal(calculationItems);
  const contingencyAmount = calculateContingencyAmount(calculationItems, contingencyPercentage);
  const grandTotal = calculateGrandTotal(calculationItems, contingencyPercentage);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Estimate Summary</h3>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="contingency_percentage"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-sm text-gray-600 flex-shrink-0 m-0">
                        Contingency:
                      </FormLabel>
                      <div className="flex items-center gap-1">
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 h-8"
                            {...field}
                          />
                        </FormControl>
                        <span>%</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <span className="font-medium">${contingencyAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t">
              <span className="text-md font-semibold">Total:</span>
              <span className="font-semibold">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TooltipProvider>
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(grandTotal.toFixed(2));
                }}
              >
                Copy Total
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy total amount to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default EstimateSummary;
