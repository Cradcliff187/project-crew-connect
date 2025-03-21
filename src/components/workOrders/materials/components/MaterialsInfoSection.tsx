
import { AddMaterialForm, MaterialsTable } from '..';
import { WorkOrderMaterial } from '@/types/workOrder';

interface MaterialsInfoSectionProps {
  materials: WorkOrderMaterial[];
  loading: boolean;
  submitting: boolean;
  vendors: { vendorid: string, vendorname: string }[];
  totalMaterialsCost: number;
  workOrderId: string;
  onMaterialPrompt: (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => void;
  onDelete: (id: string) => Promise<void>;
  onReceiptAttached: (materialId: string, documentId: string) => Promise<void>;
  onVendorAdded: () => void;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsInfoSection = ({
  materials,
  loading,
  submitting,
  vendors,
  totalMaterialsCost,
  workOrderId,
  onMaterialPrompt,
  onDelete,
  onReceiptAttached,
  onVendorAdded,
  onReceiptClick
}: MaterialsInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <AddMaterialForm 
        vendors={vendors}
        onSubmit={onMaterialPrompt}
        submitting={submitting}
        onVendorAdded={onVendorAdded}
      />
      
      <MaterialsTable 
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={onDelete}
        totalCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onReceiptUploaded={onReceiptAttached}
        onReceiptClick={onReceiptClick}
      />
    </div>
  );
};

export default MaterialsInfoSection;
