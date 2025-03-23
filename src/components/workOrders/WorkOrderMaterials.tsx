
import { useState } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';

// Import hooks
import { useMaterials, useVendors } from './materials/hooks';
import { useReceiptManager } from './materials/hooks/useReceiptManager';
import { useConfirmationManager } from './materials/hooks/useConfirmationManager';

// Import components
import { ExpensesInfoSection } from './expenses/components';
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const [selectedExpense, setSelectedExpense] = useState<WorkOrderExpense | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  
  const { 
    expenses: materials, 
    loading, 
    submitting, 
    error,
    vendors,
    totalExpensesCost: totalMaterialsCost,
    handleAddExpense: handleAddMaterial, 
    handleDelete,
    handleReceiptUploaded,
    fetchExpenses: fetchMaterials
  } = useMaterials(workOrderId);
  
  // Handle material added
  const handleMaterialAdded = () => {
    // Refresh materials list
    fetchMaterials();

    // Notify parent component if provided
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };
  
  // Handle vendor added
  const handleVendorAdded = () => {
    // Refresh materials list to get updated vendor information
    fetchMaterials();
  };
  
  // Handle material receipt clicks
  const handleReceiptClick = (material: WorkOrderExpense) => {
    setSelectedExpense(material);
    setReceiptDialogOpen(true);
  };
  
  // Handle receipt dialog closed
  const handleReceiptClosed = () => {
    setReceiptDialogOpen(false);
    setSelectedExpense(null);
  };
  
  // Handle material adding with confirmation
  const handleMaterialPrompt = async (expenseData: any) => {
    const result = await handleAddMaterial({
      ...expenseData,
      expenseName: expenseData.materialName,
      expenseType: 'materials'
    });
    
    if (result) {
      handleMaterialAdded();
    }
  };
  
  // Handle receipt attached to material
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    await handleReceiptUploaded(materialId, documentId);
    handleMaterialAdded();
  };
  
  return (
    <div className="space-y-6">
      {/* Main Materials Section */}
      <ExpensesInfoSection
        expenses={materials.filter(m => m.expense_type === 'materials' || !m.source_type || m.source_type === 'material')}
        loading={loading}
        submitting={submitting}
        vendors={vendors}
        totalExpensesCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onExpensePrompt={handleMaterialPrompt}
        onDelete={handleDelete}
        onReceiptAttached={handleReceiptAttached}
        onVendorAdded={handleVendorAdded}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Receipt Document Viewer Dialog */}
      {selectedExpense && (
        <DocumentViewerDialog
          open={receiptDialogOpen}
          onOpenChange={handleReceiptClosed}
          document={selectedExpense.receipt_document_id ? {
            document_id: selectedExpense.receipt_document_id,
            file_name: `Receipt for ${selectedExpense.expense_name}`,
            file_type: 'application/pdf', // Default type, will be determined by the component
            url: '', // Will be populated by the component
            storage_path: '',
            entity_type: 'WORK_ORDER',
            entity_id: workOrderId,
            created_at: '',
            updated_at: '',
            tags: []
          } : null}
          title={`Receipt for ${selectedExpense.expense_name}`}
          description="Receipt document preview"
        />
      )}
    </div>
  );
};

export default WorkOrderMaterials;
