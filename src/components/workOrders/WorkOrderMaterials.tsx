
import { AddMaterialForm, MaterialsTable } from './materials';
import { useMaterials, useVendors } from './materials/hooks';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const { 
    materials, 
    loading, 
    submitting, 
    totalMaterialsCost,
    handleAddMaterial, 
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  } = useMaterials(workOrderId);
  
  const { vendors, fetchVendors } = useVendors();
  
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
    await handleAddMaterial(material);
    
    // Notify parent component if provided
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };
  
  // Handle delete wrapped to add the notification
  const handleDeleteMaterial = async (id: string) => {
    await handleDelete(id);
    
    // Notify parent component if provided
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };
  
  // Handle receipt uploaded wrapped to add the notification
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    await handleReceiptUploaded(materialId, documentId);
    
    // Notify parent component if provided
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };
  
  return (
    <div className="space-y-6">
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
