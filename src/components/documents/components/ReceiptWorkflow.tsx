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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface ReceiptWorkflowProps {
  control: Control<DocumentUploadFormValues>;
  prefillAmount?: number;
  prefillVendorId?: string;
  prefillNotes?: string;
  prefillMaterialName?: string;
}

const ReceiptWorkflow: React.FC<ReceiptWorkflowProps> = ({
  control,
  prefillAmount,
  prefillVendorId,
  prefillNotes,
  prefillMaterialName,
}) => {
  const [hasRecognizedData, setHasRecognizedData] = useState(false);
  const [notes, setNotes] = useState<string | undefined>(prefillNotes);

  // Effect to handle prefill data detection
  useEffect(() => {
    const hasData = !!prefillAmount || !!prefillVendorId || !!prefillMaterialName;
    setHasRecognizedData(hasData);

    // If we have material name but no notes, set the notes
    if (prefillMaterialName && !prefillNotes) {
      const materialNote = `Receipt for: ${prefillMaterialName}`;
      setNotes(materialNote);
    } else if (prefillNotes) {
      setNotes(prefillNotes);
    }
  }, [prefillAmount, prefillVendorId, prefillMaterialName, prefillNotes]);

  // Effect to update form with notes when they change
  useEffect(() => {
    if (notes) {
      // This is not the best practice, but we don't have direct access to form.setValue here
      // A better approach would be to manage this in the parent component
    }
  }, [notes]);

  return (
    <div className="space-y-4">
      {hasRecognizedData && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Receipt data detected!</AlertTitle>
          <AlertDescription className="text-blue-700">
            We've automatically filled in some information based on the receipt image. Please verify
            and adjust if needed.
          </AlertDescription>
        </Alert>
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
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                    variant={'outline'}
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={date => field.onChange(date)}
                  disabled={date => date > new Date()}
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

      {/* Notes field */}
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receipt Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter notes about this receipt..."
                className="resize-none"
                {...field}
                value={field.value || notes || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReceiptWorkflow;
