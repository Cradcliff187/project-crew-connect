import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EntityType } from '@/types/common';
import TagsInput from './TagsInput';

interface StandardizedMetadataFormProps {
  form: UseFormReturn<any>;
  entityType: EntityType;
  category: string;
  isExpense: boolean;
  isReceiptUpload: boolean;
  prefillData?: any;
  allowEntityTypeSelection?: boolean;
}

const StandardizedMetadataForm: React.FC<StandardizedMetadataFormProps> = ({
  form,
  entityType,
  category,
  isExpense,
  isReceiptUpload,
  prefillData,
  allowEntityTypeSelection = false,
}) => {
  const [showVendorSelector, setShowVendorSelector] = useState(false);

  // Get document categories based on entity type
  const getCategoriesForEntityType = (type: EntityType) => {
    switch (type) {
      case 'PROJECT':
        return [
          { value: 'contract', label: 'Contract' },
          { value: 'photo', label: 'Photo' },
          { value: 'permit', label: 'Permit' },
          { value: 'plan', label: 'Plan' },
          { value: 'receipt', label: 'Receipt' },
          { value: 'invoice', label: 'Invoice' },
          { value: 'other', label: 'Other' },
        ];
      case 'ESTIMATE':
        return [
          { value: 'quote', label: 'Quote' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'bid', label: 'Bid' },
          { value: 'specification', label: 'Specification' },
          { value: 'other', label: 'Other' },
        ];
      case 'WORK_ORDER':
        return [
          { value: 'receipt', label: 'Receipt' },
          { value: 'invoice', label: 'Invoice' },
          { value: 'photo', label: 'Photo' },
          { value: 'timesheet', label: 'Timesheet' },
          { value: 'other', label: 'Other' },
        ];
      case 'VENDOR':
      case 'SUBCONTRACTOR':
        return [
          { value: 'certification', label: 'Certification' },
          { value: 'contract', label: 'Contract' },
          { value: 'insurance', label: 'Insurance' },
          { value: 'invoice', label: 'Invoice' },
          { value: 'other', label: 'Other' },
        ];
      case 'TIME_ENTRY':
        return [
          { value: 'receipt', label: 'Receipt' },
          { value: 'timesheet', label: 'Timesheet' },
          { value: 'other', label: 'Other' },
        ];
      default:
        return [
          { value: 'document', label: 'Document' },
          { value: 'other', label: 'Other' },
        ];
    }
  };

  // Helper to determine if a category requires vendor selection
  const categoryRequiresVendor = (category: string) => {
    return ['receipt', 'invoice', 'bid', 'quote'].includes(category);
  };

  // Entity type options
  const entityTypeOptions = [
    { value: 'PROJECT', label: 'Project' },
    { value: 'ESTIMATE', label: 'Estimate' },
    { value: 'WORK_ORDER', label: 'Work Order' },
    { value: 'VENDOR', label: 'Vendor' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'TIME_ENTRY', label: 'Time Entry' },
    { value: 'EMPLOYEE', label: 'Employee' },
  ];

  // Expense types
  const expenseTypes = [
    { value: 'MATERIAL', label: 'Material' },
    { value: 'LABOR', label: 'Labor' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Update category options when entity type changes
  useEffect(() => {
    const availableCategories = getCategoriesForEntityType(entityType);

    // If current category isn't valid for the selected entity type,
    // set it to the first available option
    const currentCategory = form.getValues('metadata.category');
    const isValidCategory = availableCategories.some(cat => cat.value === currentCategory);

    if (!isValidCategory && availableCategories.length > 0) {
      form.setValue('metadata.category', availableCategories[0].value);
    }
  }, [entityType, form]);

  // Check vendor requirement when category changes
  useEffect(() => {
    if (categoryRequiresVendor(category) && !form.getValues('metadata.vendorId')) {
      setShowVendorSelector(true);
    }
  }, [category, form]);

  return (
    <div className="space-y-6">
      {/* Entity Type Selection - if allowed */}
      {allowEntityTypeSelection && (
        <FormField
          control={form.control}
          name="metadata.entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <Select
                onValueChange={value => {
                  field.onChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {entityTypeOptions.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The type of entity this document belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Document Category */}
      <FormField
        control={form.control}
        name="metadata.category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Category</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isReceiptUpload}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getCategoriesForEntityType(entityType).map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Select the appropriate document category</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Vendor Selection - if needed for this category */}
      {(showVendorSelector || categoryRequiresVendor(category)) && (
        <FormField
          control={form.control}
          name="metadata.vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Select vendor"
                    value={form.getValues('metadata.vendorName') || ''}
                    readOnly
                    onClick={() => setShowVendorSelector(true)}
                  />
                </FormControl>
                <Button type="button" variant="outline" onClick={() => setShowVendorSelector(true)}>
                  Select
                </Button>
              </div>
              <FormDescription>
                {categoryRequiresVendor(category)
                  ? 'Required for this document type'
                  : 'Optional vendor association'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Expense Type - for expense documents */}
      {isExpense && (
        <FormField
          control={form.control}
          name="metadata.expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Categorize this expense for reporting</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Amount Field - for expense documents */}
      {isExpense && (
        <FormField
          control={form.control}
          name="metadata.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>The total amount of this expense</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Expense Date - for expense documents */}
      {isExpense && (
        <FormField
          control={form.control}
          name="metadata.expenseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expense Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
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
              <FormDescription>Date the expense was incurred</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Tags Field */}
      <FormField
        control={form.control}
        name="metadata.tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <TagsInput
                control={form.control}
                name="metadata.tags"
                prefillTags={field.value || []}
              />
            </FormControl>
            <FormDescription>Optional tags to help categorize this document</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes Field */}
      <FormField
        control={form.control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add notes about this document..."
                className="resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>Optional notes about this document</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Is Expense Toggle - if not already determined */}
      {!isReceiptUpload && category !== 'receipt' && category !== 'invoice' && (
        <FormField
          control={form.control}
          name="metadata.isExpense"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Mark as Expense</FormLabel>
                <FormDescription>Enable if this document represents an expense</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default StandardizedMetadataForm;
