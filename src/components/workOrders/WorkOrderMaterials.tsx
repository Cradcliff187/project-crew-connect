
import { AddMaterialForm, MaterialsTable } from './materials';
import { useMaterials, useVendors } from './materials/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  
  // Handle material submit wrapped to add the notification
  const handleSubmit = async (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => {
    try {
      await handleAddMaterial(material);
      
      // Notify parent component if provided
      handleMaterialAdded();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Error is already handled in the handleAddMaterial function
    }
  };
  
  // Handle delete wrapped to add the notification
  const handleDeleteMaterial = async (id: string) => {
    await handleDelete(id);
    
    // Notify parent component if provided
    handleMaterialAdded();
  };
  
  // Handle receipt uploaded wrapped to add the notification
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    await handleReceiptUploaded(materialId, documentId);
    
    // Notify parent component if provided
    handleMaterialAdded();
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
        onSubmit={handleSubmit}
        submitting={submitting}
        onVendorAdded={handleVendorAdded}
      />
      
      <MaterialsTable 
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={handleDeleteMaterial}
        totalCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onReceiptUploaded={handleReceiptAttached}
      />
    </div>
  );
};

export default WorkOrderMaterials;
