
import { useState } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';

// Import hooks
import { useMaterials, useVendors } from './materials/hooks';
import { useReceiptManager } from './materials/hooks/useReceiptManager';
import { useConfirmationManager } from './materials/hooks/useConfirmationManager';

// Import components
import { MaterialsErrorAlert, MaterialsInfoSection, ReceiptConfirmationDialog } from './materials/components';
import { ReceiptViewerDialog, ReceiptUploadDialog } from './materials/dialogs/ReceiptDialog';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const { 
    materials, 
    loading, 
    submitting, 
    error,
    totalMaterialsCost,
    handleAddMaterial, 
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  } = useMaterials(workOrderId);
  
  const { vendors, loading: vendorsLoading, error: vendorsError, fetchVendors } = useVendors();
  
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
    // Refresh vendors list
    fetchVendors();
  };
  
  // Use the receipt manager hook
  const {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  } = useReceiptManager();
  
  // Use the confirmation manager hook
  const {
    showReceiptConfirmation,
    setShowReceiptConfirmation,
    pendingMaterial,
    handlePromptForReceipt,
    handleConfirmWithReceipt,
    handleConfirmWithoutReceipt
  } = useConfirmationManager(handleAddMaterial, handleReceiptUploaded, handleMaterialAdded);
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return "";
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : "Unknown Vendor";
  };
  
  // Handle confirmation to add material with receipt
  const confirmWithReceipt = async () => {
    const result = await handleConfirmWithReceipt();
    if (result?.showReceiptUpload) {
      setShowReceiptUpload(true);
      setSelectedMaterial(result.selectedMaterial);
      setShowReceiptConfirmation(false);
    }
  };
  
  // Handle receipt uploaded
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    console.log("Receipt attached. Material ID:", materialId, "Document ID:", documentId);
    await handleReceiptUploaded(materialId, documentId);
    setShowReceiptUpload(false);
    
    // Refresh the materials list
    handleMaterialAdded();
  };
  
  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <MaterialsErrorAlert error={error || vendorsError} />
      
      {/* Main Materials Section - Now prioritizing the table view */}
      <MaterialsInfoSection 
        materials={materials}
        loading={loading}
        submitting={submitting}
        vendors={vendors}
        totalMaterialsCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onMaterialPrompt={handlePromptForReceipt}
        onDelete={handleDelete}
        onReceiptAttached={handleReceiptAttached}
        onVendorAdded={handleVendorAdded}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Dialogs - no changes needed */}
      <ReceiptConfirmationDialog
        open={showReceiptConfirmation}
        onOpenChange={setShowReceiptConfirmation}
        materialData={pendingMaterial}
        vendorName={pendingMaterial?.vendorId ? getVendorName(pendingMaterial.vendorId) : ""}
        onConfirmWithReceipt={confirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />
      
      <ReceiptUploadDialog
        open={showReceiptUpload}
        material={selectedMaterial}
        workOrderId={workOrderId}
        vendorName={selectedMaterial?.vendor_id ? getVendorName(selectedMaterial.vendor_id) : ""}
        onSuccess={handleReceiptAttached}
        onCancel={() => setShowReceiptUpload(false)}
      />
      
      <ReceiptViewerDialog
        open={viewingReceipt}
        onOpenChange={(open) => !open && handleCloseReceiptViewer()}
        receiptDocument={receiptDocument}
      />
    </div>
  );
};

export default WorkOrderMaterials;
