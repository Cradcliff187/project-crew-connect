
import React, { useState } from 'react';
import { Control, Controller, UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

import { 
  documentCategories, 
  entityTypes, 
  DocumentUploadFormValues 
} from '../schemas/documentSchema';
import VendorSelector from './VendorSelector';
import EntitySelector from './EntitySelector';
import ExpenseForm from '../ExpenseForm';
import TagsInput from './TagsInput';

interface MetadataFormProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: string | undefined;
  isReceiptUpload?: boolean;
  showVendorSelector: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
  };
}

const MetadataForm: React.FC<MetadataFormProps> = ({ 
  form, 
  control, 
  watchIsExpense, 
  watchVendorType,
  isReceiptUpload = false,
  showVendorSelector,
  prefillData
}) => {
  const [showTags, setShowTags] = useState(false);
  
  const watchEntityType = form.watch('metadata.entityType');
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Document Category */}
        <FormField
          control={control}
          name="metadata.category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === '3rd_party_estimate' ? '3rd Party Estimate' : 
                        category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Entity Type */}
        <FormField
          control={control}
          name="metadata.entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related To</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isReceiptUpload}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Entity ID Selector */}
      <EntitySelector 
        control={control} 
        entityType={watchEntityType} 
        isReceiptUpload={isReceiptUpload}
      />
      
      {/* "Is Expense" Switch */}
      {!isReceiptUpload && (
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="is-expense"
            checked={watchIsExpense}
            onCheckedChange={(checked) => {
              form.setValue('metadata.isExpense', checked);
              if (checked) {
                form.setValue('metadata.expenseType', 'materials');
              }
            }}
          />
          <Label htmlFor="is-expense">This document is an expense record</Label>
        </div>
      )}
      
      {/* Expense Details (conditional) */}
      {(watchIsExpense || isReceiptUpload) && (
        <ExpenseForm 
          control={control} 
          isReceiptUpload={isReceiptUpload} 
        />
      )}
      
      {/* Vendor Section (conditional) */}
      {(showVendorSelector || watchIsExpense) && (
        <div className="pt-2">
          <Separator className="my-2" />
          <VendorSelector 
            control={control} 
            vendorType={watchVendorType} 
            prefillVendorId={prefillData?.vendorId}
          />
        </div>
      )}
      
      {/* Notes */}
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any additional notes about this document"
                className="resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Tags (expandable) */}
      <div>
        {!showTags ? (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowTags(true)}
            className="flex items-center text-muted-foreground"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Tags
          </Button>
        ) : (
          <FormField
            control={control}
            name="metadata.tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add tags and press Enter"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default MetadataForm;
