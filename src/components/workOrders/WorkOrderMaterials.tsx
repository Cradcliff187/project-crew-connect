
import { AddMaterialForm, MaterialsTable } from './materials';
import { useMaterials, useVendors } from './materials/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { MaterialReceiptUpload, ReceiptConfirmationDialog } from './materials/components';
import { WorkOrderMaterial } from '@/types/workOrder';

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
  
  // State for receipt confirmation dialog
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);
  const [pendingMaterial, setPendingMaterial] = useState<{
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  } | null>(null);

  // State for receipt upload dialog
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<WorkOrderMaterial | null>(null);
  
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
  
  // Handle prompt for receipt upload
  const handlePromptForReceipt = (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => {
    setPendingMaterial(material);
    setShowReceiptConfirmation(true);
  };
  
  // Handle confirmation to add material with receipt
  const handleConfirmWithReceipt = async () => {
    if (!pendingMaterial) return;
    
    try {
      // Create the material
      const newMaterial = await handleAddMaterial(pendingMaterial);
      
      // Show the receipt upload dialog for the new material
      if (newMaterial) {
        setSelectedMaterial(newMaterial as WorkOrderMaterial);
        setShowReceiptUpload(true);
      }
      
      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingMaterial(null);
      
      // Refresh the materials list
      handleMaterialAdded();
    } catch (error) {
      console.error("Error in handleConfirmWithReceipt:", error);
    }
  };
  
  // Handle confirmation to add material without receipt
  const handleConfirmWithoutReceipt = async () => {
    if (!pendingMaterial) return;
    
    try {
      await handleAddMaterial(pendingMaterial);
      
      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingMaterial(null);
      
      // Refresh the materials list
      handleMaterialAdded();
    } catch (error) {
      console.error("Error in handleConfirmWithoutReceipt:", error);
    }
  };
  
  // Handle receipt button click
  const handleReceiptClick = (material: WorkOrderMaterial) => {
    setSelectedMaterial(material);
    setShowReceiptUpload(true);
  };
  
  // Handle receipt uploaded
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    await handleReceiptUploaded(materialId, documentId);
    setShowReceiptUpload(false);
    
    // Refresh the materials list
    handleMaterialAdded();
  };
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return "";
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : "Unknown Vendor";
  };
  
  return (
    <div className="space-y-6">
      {(error || vendorsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || vendorsError}. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      )}
      
      <AddMaterialForm 
        vendors={vendors}
        onSubmit={handlePromptForReceipt}
        submitting={submitting}
        onVendorAdded={handleVendorAdded}
      />
      
      <MaterialsTable 
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={handleDelete}
        totalCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onReceiptUploaded={handleReceiptAttached}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Receipt Confirmation Dialog */}
      <ReceiptConfirmationDialog
        open={showReceiptConfirmation}
        onOpenChange={setShowReceiptConfirmation}
        materialData={pendingMaterial}
        vendorName={pendingMaterial?.vendorId ? getVendorName(pendingMaterial.vendorId) : ""}
        onConfirmWithReceipt={handleConfirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />
      
      {/* Material Receipt Upload Dialog */}
      {selectedMaterial && (
        <div className={showReceiptUpload ? "block" : "hidden"}>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowReceiptUpload(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
            <MaterialReceiptUpload
              workOrderId={workOrderId}
              material={selectedMaterial}
              vendorName={getVendorName(selectedMaterial.vendor_id)}
              onSuccess={(documentId) => handleReceiptAttached(selectedMaterial.id, documentId)}
              onCancel={() => setShowReceiptUpload(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderMaterials;
