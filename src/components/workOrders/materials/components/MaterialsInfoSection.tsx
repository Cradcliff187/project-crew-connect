
import { useState } from 'react';
import { AddMaterialForm, MaterialsTable } from '..';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Materials Table - Now displayed first */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#0485ea]">Materials & Supplies</h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            {showAddForm ? (
              <>
                <ChevronUp size={16} />
                Hide Form
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                Add Material
              </>
            )}
          </Button>
        </div>
        
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
      
      {/* Add Material Form - Now collapsible */}
      {showAddForm && (
        <Card className="border-2 border-[#0485ea]/10 shadow-md">
          <AddMaterialForm 
            vendors={vendors}
            onSubmit={onMaterialPrompt}
            submitting={submitting}
            onVendorAdded={onVendorAdded}
          />
        </Card>
      )}
    </div>
  );
};

export default MaterialsInfoSection;
