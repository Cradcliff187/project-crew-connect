
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ExpenseFormValues } from '../hooks/useExpenseForm';

interface ExpenseFormFieldsProps {
  form: UseFormReturn<ExpenseFormValues>;
  budgetItems: any[];
  vendors: any[];
  onAttachReceipt: () => void;
  hasAttachedReceipt: boolean;
}

const ExpenseFormFields: React.FC<ExpenseFormFieldsProps> = ({
  form,
  budgetItems,
  vendors,
  onAttachReceipt,
  hasAttachedReceipt
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe this expense"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="expense_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
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
                      format(field.value, "PPP")
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
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="budget_item_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Budget Category</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a budget category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Uncategorized</SelectItem>
                {budgetItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.category} {item.description ? `- ${item.description}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vendor_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">No Vendor</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                    {vendor.vendorname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline"
          onClick={onAttachReceipt}
        >
          Attach Receipt
        </Button>
        
        {hasAttachedReceipt && (
          <span className="text-sm text-green-600">Receipt attached</span>
        )}
      </div>
    </div>
  );
};

export default ExpenseFormFields;
