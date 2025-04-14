import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, DocumentCategory } from '../schemas/documentSchema';
import {
  getEntityCategories,
  getCategoryDisplayName,
  isValidDocumentCategory,
} from '../utils/DocumentCategoryHelper';
import { useIsMobile } from '@/hooks/use-mobile';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  entityType?: EntityType;
}

const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({
  control,
  isReceiptUpload = false,
  entityType,
}) => {
  const isMobile = useIsMobile();

  // Get available categories based on entity type
  const availableCategories = entityType ? getEntityCategories(entityType) : [];

  if (isReceiptUpload) {
    return (
      <FormField
        control={control}
        name="metadata.category"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Receipt Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={value => field.onChange(value as DocumentCategory)}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receipt" id="receipt" />
                  <label htmlFor="receipt" className="text-sm font-normal cursor-pointer">
                    Material Receipt
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <label htmlFor="invoice" className="text-sm font-normal cursor-pointer">
                    Subcontractor Invoice
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Create a list of categories to display based on entity type
  // Filter for only valid DocumentCategory types
  const baseCategories: DocumentCategory[] = ['receipt', 'invoice'];

  // Ensure we only include valid DocumentCategory values by explicitly checking with our type guard
  const additionalCategories: DocumentCategory[] =
    availableCategories.length > 0
      ? availableCategories.filter(isValidDocumentCategory)
      : ['3rd_party_estimate', 'contract', 'insurance', 'certification', 'photo', 'other'];

  const categoriesToShow: DocumentCategory[] = [...baseCategories, ...additionalCategories];

  // Remove duplicates
  const uniqueCategories = Array.from(new Set(categoriesToShow));

  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Document Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={value => field.onChange(value as DocumentCategory)}
              defaultValue={field.value}
              className={isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-4'}
            >
              {uniqueCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={`${category}-doc`} />
                  <label htmlFor={`${category}-doc`} className="text-sm font-normal cursor-pointer">
                    {getCategoryDisplayName(category)}
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
