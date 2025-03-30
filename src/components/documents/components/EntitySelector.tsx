
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, InternalEntityType } from '../schemas/documentSchema';
import { EntitySelectorComponent } from './EntitySelectorComponent';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ 
  control,
  isReceiptUpload = false
}) => {
  return (
    <FormField
      control={control}
      name="metadata.entityType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Attach To</FormLabel>
          <FormControl>
            <EntitySelectorComponent 
              entityType={field.value as InternalEntityType}
              value={field.value}
              onChange={(value) => field.onChange(value as EntityType)}
              disabled={isReceiptUpload}
              placeholder={isReceiptUpload ? "Automatically assigned" : "Select entity type"}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
