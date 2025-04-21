
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityType } from '@/types/common';
import { DocumentCategory } from '@/components/documents/schemas/documentSchema';

// Create a simple metadata form component that accepts the types from common.ts
interface StandardizedMetadataFormProps {
  form: UseFormReturn<any, any>; 
  entityType: EntityType;
  category: DocumentCategory | string;
  isExpense: boolean;
  isReceiptUpload?: boolean;
  prefillData?: any;
  allowEntityTypeSelection?: boolean;
}

const StandardizedMetadataForm: React.FC<StandardizedMetadataFormProps> = ({
  form,
  entityType,
  category,
  isExpense,
  isReceiptUpload = false,
  prefillData,
  allowEntityTypeSelection = false,
}) => {
  // Array of entity types matching our common.ts definition
  const entityTypes: EntityType[] = [
    'PROJECT',
    'ESTIMATE',
    'WORK_ORDER',
    'VENDOR',
    'SUBCONTRACTOR',
    'TIME_ENTRY',
    'EMPLOYEE',
    'CONTACT',
    'CUSTOMER',
    'EXPENSE',
    'ESTIMATE_ITEM'
  ];

  const handleEntityTypeChange = (value: string) => {
    form.setValue('metadata.entityType', value as EntityType);
  };

  return (
    <div className="space-y-4">
      {allowEntityTypeSelection && (
        <FormField
          control={form.control}
          name="metadata.entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select value={field.value} onValueChange={handleEntityTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the type of entity this document relates to</FormDescription>
            </FormItem>
          )}
        />
      )}

      {/* This is a simplified component - in a real implementation, 
          you would add more fields for category, vendors, expense types, etc. */}
      
      {entityType && (
        <FormDescription>
          This document will be associated with {entityType.replace(/_/g, ' ').toLowerCase()}{' '}
          records.
        </FormDescription>
      )}
    </div>
  );
};

export default StandardizedMetadataForm;
