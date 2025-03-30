
import { WorkOrderMaterial } from '@/types/workOrder';
import { useReceiptManager as useSharedReceiptManager } from '@/hooks/useReceiptManager';

export function useReceiptManager() {
  return useSharedReceiptManager<WorkOrderMaterial>({
    entityType: 'material',
    onCloseCallback: () => {
      console.log('Material receipt viewer closed');
    }
  });
}
