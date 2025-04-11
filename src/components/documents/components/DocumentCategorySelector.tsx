
import React, { useMemo } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, DocumentCategory, getEntityCategories } from '../schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  entityType?: EntityType;
}

/**
 * Component to select document categories based on entity type
 */
const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({
  control,
  isReceiptUpload = false,
  entityType
}) => {
  // Get categories based on entity type or use default ones
  const availableCategories = useMemo(() => {
    if (isReceiptUpload) {
      return [DocumentCategory.RECEIPT];
    }
    
    if (entityType) {
      return getEntityCategories(entityType);
    }
    
    // Default categories for fallback
    return [
      DocumentCategory.GENERAL,
      DocumentCategory.CONTRACT,
      DocumentCategory.INVOICE,
      DocumentCategory.PHOTO,
      DocumentCategory.OTHER
    ];
  }, [entityType, isReceiptUpload]);

  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium text-slate-700">Document Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value?.toString() || ''}
            disabled={isReceiptUpload}
          >
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentCategorySelector;
