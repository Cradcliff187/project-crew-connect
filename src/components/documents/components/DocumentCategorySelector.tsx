
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityType, DocumentCategory, getEntityCategories } from '../schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<any>;
  isReceiptUpload?: boolean;
  entityType: EntityType;
}

// This component handles category selection based on entity type
const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({
  control,
  isReceiptUpload = false,
  entityType
}) => {
  // Get categories for the given entity type
  const availableCategories = getEntityCategories(entityType);

  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={isReceiptUpload} // When it's a receipt upload, the category is fixed
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Document Categories</SelectLabel>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentCategorySelector;
