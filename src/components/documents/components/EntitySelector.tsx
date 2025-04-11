
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentUploadFormValues, entityTypes } from '../schemas/documentSchema';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ control, isReceiptUpload = false }) => {
  return (
    <FormField
      control={control}
      name="metadata.entityType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Entity Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ')}
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

export default EntitySelector;
