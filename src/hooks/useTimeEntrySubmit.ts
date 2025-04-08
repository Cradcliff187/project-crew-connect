
import { TimeEntryFormValues } from '@/components/timeTracking/hooks/useTimeEntryForm';
import { ReceiptMetadata } from '@/types/timeTracking';
import { useTimeEntryCore } from './timeTracking/useTimeEntryCore';

export function useTimeEntrySubmit(onSuccess: () => void) {
  const { isSubmitting, submitTimeEntry: coreSubmit } = useTimeEntryCore(onSuccess);

  const submitTimeEntry = async (
    data: TimeEntryFormValues, 
    selectedFiles: File[] = [],
    receiptMetadata: ReceiptMetadata = { 
      category: 'receipt', 
      expenseType: null, 
      tags: ['time-entry'],
      vendorType: 'vendor' 
    }
  ) => {
    return coreSubmit(data, selectedFiles, receiptMetadata);
  };

  return {
    isSubmitting,
    submitTimeEntry
  };
}
