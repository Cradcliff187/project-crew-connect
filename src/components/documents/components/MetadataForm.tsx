import React, { useEffect } from 'react';
import { UseFormReturn, Control } from 'react-hook-form';
import {
  DocumentUploadFormValues,
  EntityType,
  entityTypes,
  expenseTypeRequiresVendor,
  expenseTypeAllowsSubcontractor,
} from '../schemas/documentSchema';
import EntitySelector from './EntitySelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import DocumentCategorySelector from './DocumentCategorySelector';
import TagsInput from './TagsInput';
import AmountField from './AmountField';
import ExpenseDatePicker from './ExpenseDatePicker';
import VendorTypeSelector from './VendorTypeSelector';
import VendorSelector from './VendorSelector';
import NotesField from './NotesField';
import BudgetItemSelector from './BudgetItemSelector';
import { FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MetadataFormProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: 'vendor' | 'subcontractor' | 'other' | undefined;
  watchCategory: string;
  watchEntityType: EntityType;
  isReceiptUpload?: boolean;
  showVendorSelector: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    tags?: string[];
    category?: string;
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
  };
  allowEntityTypeSelection?: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  form,
  control,
  watchIsExpense,
  watchVendorType,
  watchCategory,
  watchEntityType,
  isReceiptUpload = false,
  showVendorSelector,
  prefillData,
  allowEntityTypeSelection = false,
}) => {
  // Helper to determine if we should show expense fields
  const showExpenseFields =
    isReceiptUpload || watchIsExpense || watchCategory === 'receipt' || watchCategory === 'invoice';

  // Helper to determine if we should show budget selector
  const showBudgetSelector =
    (watchEntityType === 'PROJECT' || watchEntityType === 'WORK_ORDER') && showExpenseFields;

  // Get current expense type
  const watchExpenseType = form.watch('metadata.expenseType');

  // Set vendor type when expense type changes
  useEffect(() => {
    if (!watchExpenseType || watchVendorType) return;

    // Auto-select vendor type based on expense type
    if (expenseTypeRequiresVendor(watchExpenseType)) {
      form.setValue('metadata.vendorType', 'vendor');
    } else if (expenseTypeAllowsSubcontractor(watchExpenseType)) {
      form.setValue('metadata.vendorType', 'subcontractor');
    }
  }, [watchExpenseType, watchVendorType, form]);

  // Handle entity type changes
  const handleEntityTypeChange = (value: string) => {
    const newEntityType = value as EntityType;
    form.setValue('metadata.entityType', newEntityType);

    // Reset entity ID when changing entity type
    form.setValue('metadata.entityId', '');

    // Update category if necessary
    const currentCategory = form.getValues('metadata.category');

    // Set default category based on entity type
    if (newEntityType === 'VENDOR' || newEntityType === 'SUBCONTRACTOR') {
      // For vendor/subcontractor, default to certification if not already receipt/invoice
      if (!['receipt', 'invoice'].includes(currentCategory)) {
        form.setValue('metadata.category', 'certification');
      }
    } else if (newEntityType === 'PROJECT') {
      // For projects, default to photo if not already receipt/invoice
      if (!['receipt', 'invoice'].includes(currentCategory)) {
        form.setValue('metadata.category', 'photo');
      }
    } else if (newEntityType === 'WORK_ORDER') {
      // For work orders, default to receipt if not already set
      if (!['receipt', 'invoice'].includes(currentCategory)) {
        form.setValue('metadata.category', 'receipt');
      }
    }
  };

  // Effect to handle category changes
  useEffect(() => {
    if (watchCategory === 'receipt' || watchCategory === 'invoice') {
      // Set isExpense to true for receipts and invoices
      form.setValue('metadata.isExpense', true);
    }
  }, [watchCategory, form]);

  // Set parent entity if provided and we're uploading an expense receipt
  useEffect(() => {
    if (prefillData?.parentEntityType && prefillData?.parentEntityId && showExpenseFields) {
      form.setValue('metadata.parentEntityType', prefillData.parentEntityType as EntityType);
      form.setValue('metadata.parentEntityId', prefillData.parentEntityId);
    }
  }, [prefillData, form, showExpenseFields]);

  // Set budget item ID if provided
  useEffect(() => {
    if (prefillData?.budgetItemId && showExpenseFields) {
      form.setValue('metadata.budgetItemId', prefillData.budgetItemId);
    }
  }, [prefillData, form, showExpenseFields]);

  return (
    <div className="space-y-4">
      {allowEntityTypeSelection && (
        <FormField
          control={control}
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

      {!isReceiptUpload && (
        <DocumentCategorySelector
          control={control}
          isReceiptUpload={isReceiptUpload}
          entityType={watchEntityType}
        />
      )}

      <EntitySelector
        control={control}
        isReceiptUpload={isReceiptUpload}
        entityType={watchEntityType}
      />

      {!isReceiptUpload && showExpenseFields && (
        <VendorTypeSelector control={control} watchExpenseType={watchExpenseType} />
      )}

      {showVendorSelector && watchVendorType && (
        <VendorSelector
          control={control}
          vendorType={watchVendorType}
          prefillVendorId={prefillData?.vendorId}
        />
      )}

      {showExpenseFields && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AmountField
              control={control}
              isReceiptUpload={isReceiptUpload}
              prefillAmount={prefillData?.amount}
            />
            <ExpenseDatePicker control={control} />
          </div>

          <ExpenseTypeSelector control={control} />

          {showBudgetSelector && (
            <BudgetItemSelector
              control={control}
              entityType={watchEntityType}
              entityId={form.watch('metadata.entityId')}
              prefillBudgetItemId={prefillData?.budgetItemId}
            />
          )}
        </>
      )}

      <TagsInput control={control} name="metadata.tags" prefillTags={prefillData?.tags} />

      <NotesField
        control={control}
        prefillText={
          prefillData?.notes ||
          (prefillData?.materialName ? `Receipt for: ${prefillData.materialName}` : undefined)
        }
      />

      {watchEntityType && (
        <FormDescription>
          This document will be associated with {watchEntityType.replace(/_/g, ' ').toLowerCase()}{' '}
          records.
        </FormDescription>
      )}
    </div>
  );
};

export default MetadataForm;
