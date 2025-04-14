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
  const watchEntityId = form.watch('metadata.entityId');
  const watchAmount = form.watch('metadata.amount');
  const watchExpenseDate = form.watch('metadata.expenseDate');
  const watchTags = form.watch('metadata.tags') || [];

  // Helper to determine if vendor selection is needed
  const needsVendorSelection = useCallback(() => {
    return (
      watchIsExpense ||
      watchCategory === 'receipt' ||
      watchCategory === 'invoice' ||
      watchEntityType === 'VENDOR' ||
      watchEntityType === 'SUBCONTRACTOR'
    );
  }, [watchIsExpense, watchCategory, watchEntityType]);

  // Helper to determine if entity selection is needed
  const needsEntitySelection = useCallback(() => {
    return !!(watchEntityType && !watchEntityId);
  }, [watchEntityType, watchEntityId]);

  return {
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType,
    watchEntityId,
    watchAmount,
    watchExpenseDate,
    watchTags,
    needsVendorSelection,
    needsEntitySelection,
  };
};
