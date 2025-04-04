
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, VendorType } from '../schemas/documentSchema';

export const useFormValueWatchers = (form: UseFormReturn<DocumentUploadFormValues>) => {
  const watchIsExpense = form.watch('metadata.isExpense');
  const watchVendorType = form.watch('metadata.vendorType') as VendorType;
  const watchFiles = form.watch('files') || [];
  const watchCategory = form.watch('metadata.category');
  const watchExpenseType = form.watch('metadata.expenseType');
  const watchEntityType = form.watch('metadata.entityType') as EntityType;

  return {
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType
  };
};
