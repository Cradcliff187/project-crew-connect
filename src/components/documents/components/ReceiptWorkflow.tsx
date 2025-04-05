
import React, { useState, useEffect } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import VendorSelector from './VendorSelector';

interface ReceiptWorkflowProps {
  control: Control<DocumentUploadFormValues>;
  prefillAmount?: number;
  prefillVendorId?: string;
}

const ReceiptWorkflow: React.FC<ReceiptWorkflowProps> = ({ 
  control,
  prefillAmount,
  prefillVendorId
}) => {
  const [hasRecognizedData, setHasRecognizedData] = useState(false);
  
  // For future implementation: OCR receipt data recognition simulation
  useEffect(() => {
    // This would be replaced with actual OCR processing in the full implementation
    const simulateOCRProcessing = () => {
      const hasData = !!prefillAmount || !!prefillVendorId;
      setHasRecognizedData(hasData);
    };
    
    simulateOCRProcessing();
  }, [prefillAmount, prefillVendorId]);
  
  return (
    <div className="space-y-4">
      {hasRecognizedData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <span className="font-medium text-blue-800">Receipt data detected!</span>
          <p className="text-blue-700 mt-1">
            We've automatically filled in some information based on the receipt image.
            Please verify and adjust if needed.
          </p>
        </div>
      )}
      
      {/* Amount field */}
      <FormField
        control={control}
        name="metadata.amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receipt Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Date picker */}
      <FormField
        control={control}
        name="metadata.expenseDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Receipt Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Vendor selection */}
      <VendorSelector
        control={control}
        vendorType="vendor"
        prefillVendorId={prefillVendorId}
        onAddVendorClick={() => {
          // This would be linked to a vendor creation flow in the future
          console.log('Add vendor clicked');
        }}
      />
      
      {/* Expense type */}
      <ExpenseTypeSelector control={control} />
    </div>
  );
};

export default ReceiptWorkflow;
