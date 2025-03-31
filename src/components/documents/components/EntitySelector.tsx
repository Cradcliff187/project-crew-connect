
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, entityTypes } from '../schemas/documentSchema';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  instanceId?: string; // Add instanceId prop
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ 
  control,
  isReceiptUpload = false,
  instanceId = 'default-entity' // Default value
}) => {
  return (
    <FormField
      control={control}
      name="metadata.entityType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Related To</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={isReceiptUpload}
            >
              <SelectTrigger id={`${instanceId}-entity-type-trigger`}>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    id={`${instanceId}-entity-type-${type}`}
                  >
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
