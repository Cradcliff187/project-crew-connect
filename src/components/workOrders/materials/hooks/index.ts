
export { useExpenses as useMaterials } from '../../expenses/hooks/useExpenses';
export { useVendors } from './useVendors';
export { useReceiptManager } from './useReceiptManager';
export { useConfirmationManager } from './useConfirmationManager';

// Export renamed components for backward compatibility
export { useExpensesFetch as useMaterialsFetch } from '../../expenses/hooks/useExpensesFetch';
export { useExpenseOperations as useMaterialOperations } from '../../expenses/hooks/useExpenseOperations';
export { useReceiptOperations } from '../../expenses/hooks/useReceiptOperations';
