import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatCurrency } from '@/lib/utils';
import { ExpenseFormValues } from '../hooks/useExpenseForm';
import { EXPENSE_TYPES, expenseTypeRequiresVendor } from '@/constants/expenseTypes';

// Filter out expense types that should not be manually added (e.g., Labor)
const MANUAL_EXPENSE_CATEGORIES = EXPENSE_TYPES.filter(
  type => type.value !== 'labor' // Exclude 'labor'
  // Add other exclusions like 'subcontractor' if needed:
  // && type.value !== 'subcontractor'
);

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
  hasAttachedReceipt,
}) => {
  // Watch the *category* field now for vendor logic
  const watchCategory = form.watch('category');
  // Use the watched category to determine if vendor is required
  const requiresVendor = expenseTypeRequiresVendor(watchCategory || '');

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe this expense" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Category</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || ''}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select the main expense category..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MANUAL_EXPENSE_CATEGORIES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
                  onChange={e => {
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
                    variant={'outline'}
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
            <FormLabel>Link to Budget Item</FormLabel>
            <Select
              onValueChange={val => field.onChange(val === 'none' ? null : val)}
              defaultValue={field.value || 'none'}
              value={field.value || 'none'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Link expense to a specific budget line item..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Do not link to a specific item</SelectItem>
                {(budgetItems || []).map((item, index) => {
                  try {
                    console.log(`[ExpenseFormFields] Processing budget item ${index}:`, item);
                    const label = `${item?.category || 'Uncat.'}: ${item?.description || '(No desc.)'} (${formatCurrency(item?.estimated_amount || 0)})`;
                    console.log(`[ExpenseFormFields] Generated label for item ${index}:`, label);
                    return (
                      <SelectItem key={item?.id || `item-${index}`} value={item?.id}>
                        {label}
                      </SelectItem>
                    );
                  } catch (error) {
                    console.error(
                      `[ExpenseFormFields] Error processing budget item at index ${index}:`,
                      item,
                      error
                    );
                    return null;
                  }
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Linking helps track variance against specific budget lines.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="vendor_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{requiresVendor ? 'Vendor (Required)' : 'Vendor'}</FormLabel>
            <Select
              onValueChange={val => field.onChange(val === 'none' ? null : val)}
              defaultValue={field.value || 'none'}
              value={field.value || 'none'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      requiresVendor ? 'Choose a vendor (required)' : 'Choose a vendor (optional)'
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No Vendor</SelectItem>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                    {vendor.vendorname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {requiresVendor && (
              <p className="text-sm text-muted-foreground">
                This expense category requires a vendor
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={onAttachReceipt}>
          Attach Receipt
        </Button>

        {hasAttachedReceipt && <span className="text-sm text-green-600">Receipt attached</span>}
      </div>
    </div>
  );
};

export default ExpenseFormFields;
