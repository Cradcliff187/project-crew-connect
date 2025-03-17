
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext, useWatch } from 'react-hook-form';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { calculateSubtotal, calculateContingencyAmount, calculateGrandTotal } from '../utils/estimateCalculations';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

const EstimateSummary = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Watch for changes in the items and contingency_percentage fields
  const items = useWatch({
    control: form.control,
    name: "items",
    defaultValue: []
  });
  
  const contingencyPercentage = useWatch({
    control: form.control,
    name: "contingency_percentage",
    defaultValue: "0"
  });

  const subtotal = calculateSubtotal(items);
  const contingencyAmount = calculateContingencyAmount(items, contingencyPercentage);
  const grandTotal = calculateGrandTotal(items, contingencyPercentage);

  return (
    <div className="mt-6 space-y-4">
      <FormField
        control={form.control}
        name="contingency_percentage"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Contingency Percentage</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a percentage for unexpected costs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <div className="flex items-center">
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="max-w-[120px]"
                  {...field}
                />
                <span className="ml-2">%</span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted p-4 rounded-md space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Contingency Amount:</span>
          <span>${contingencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center font-medium border-t pt-2 mt-2">
          <span>Total Estimate Amount:</span>
          <span>${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};

export default EstimateSummary;
