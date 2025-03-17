
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash } from 'lucide-react';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

const EstimateItemFields = () => {
  const form = useFormContext<EstimateFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Items</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ description: '', quantity: '1', unitPrice: '0' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md">
          <div className="col-span-12 md:col-span-6">
            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6 md:col-span-2">
            <FormField
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity*</FormLabel>
                  <FormControl>
                    <Input placeholder="0" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <FormField
              control={form.control}
              name={`items.${index}.unitPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price*</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="hidden md:flex md:col-span-1 items-end justify-end pb-1.5">
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EstimateItemFields;
