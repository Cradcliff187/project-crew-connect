
import { WorkOrderExpense } from '@/types/workOrder';
import { useReceiptManager as useSharedReceiptManager } from '@/hooks/useReceiptManager';

export function useReceiptManager() {
  return useSharedReceiptManager<WorkOrderExpense>({
    entityType: 'expense',
    onCloseCallback: () => {
      console.log('Expense receipt viewer closed');
    }
  });
}
