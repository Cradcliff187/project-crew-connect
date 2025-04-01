
import { UseFormReturn } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { useDebounce } from '@/hooks/useDebounce';

export const useFormValueWatchers = (
  form: UseFormReturn<DocumentUploadFormValues>
) => {
  // Use debounced values for form watches to prevent excessive re-renders
  const watchIsExpense = useDebounce(form.watch('metadata.isExpense'), 300);
  const watchVendorType = useDebounce(form.watch('metadata.vendorType'), 300);
  const watchCategory = useDebounce(form.watch('metadata.category'), 300);
  const watchExpenseType = useDebounce(form.watch('metadata.expenseType'), 300);
  
  // Don't debounce files as we need immediate feedback
  const watchFiles = form.watch('files');

  return {
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType
  };
};
