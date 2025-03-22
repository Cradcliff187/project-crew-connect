
import { useState } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTable } from '..';
import { SectionHeader, AddMaterialSheet } from './header';

interface MaterialsInfoSectionProps {
  materials: WorkOrderMaterial[];
  loading: boolean;
  submitting: boolean;
  vendors: { vendorid: string, vendorname: string }[];
  totalMaterialsCost: number;
  workOrderId: string;
  onMaterialPrompt: (materialData: any) => void;
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
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <SectionHeader onAddClick={() => setShowAddForm(true)} />
      
      {/* Materials Table */}
      <MaterialsTable
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={onDelete}
        onReceiptUploaded={onReceiptAttached}
        totalCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onReceiptClick={onReceiptClick}
      />
      
      {/* Add Material Sheet */}
      <AddMaterialSheet
        open={showAddForm}
        onOpenChange={setShowAddForm}
        workOrderId={workOrderId}
        vendors={vendors}
        submitting={submitting}
        onMaterialPrompt={onMaterialPrompt}
        onVendorAdded={onVendorAdded}
        onSuccess={() => setShowAddForm(false)}
      />
    </div>
  );
};

export default MaterialsInfoSection;
