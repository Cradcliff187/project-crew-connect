
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, documentCategories } from '../schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  instanceId?: string; // Add instanceId prop
}

const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({ 
  control,
  isReceiptUpload = false,
  instanceId = 'default-category'  // Default value
}) => {
  // If it's a receipt upload, we'll force the category to be 'receipt'
  if (isReceiptUpload) {
    return null;
  }

  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Document Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-4"
            >
              {documentCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={`${instanceId}-category-${category}`} />
                  <label 
                    htmlFor={`${instanceId}-category-${category}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentCategorySelector;
