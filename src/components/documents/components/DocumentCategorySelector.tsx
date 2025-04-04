
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { 
  DocumentUploadFormValues,
  EntityType,
  DocumentCategory
} from '../schemas/documentSchema';
import { getEntityCategories } from '../utils/DocumentCategoryHelper';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  entityType?: EntityType;
}

const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({ 
  control, 
  isReceiptUpload = false,
  entityType
}) => {
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
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receipt" id="receipt" />
                  <label htmlFor="receipt" className="text-sm font-normal cursor-pointer">Material Receipt</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <label htmlFor="invoice" className="text-sm font-normal cursor-pointer">Subcontractor Invoice</label>
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
  const categoriesToShow: DocumentCategory[] = [
    'receipt', 
    'invoice',
    ...(availableCategories.length > 0 
      ? availableCategories.filter(c => !['receipt', 'invoice'].includes(c)) 
      : ['3rd_party_estimate', 'contract', 'insurance', 'certification', 'photo', 'other'])
  ];

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
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-4"
            >
              {uniqueCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={`${category}-doc`} />
                  <label htmlFor={`${category}-doc`} className="text-sm font-normal cursor-pointer">
                    {category === '3rd_party_estimate' ? 'Estimate' : category.charAt(0).toUpperCase() + category.slice(1)}
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
