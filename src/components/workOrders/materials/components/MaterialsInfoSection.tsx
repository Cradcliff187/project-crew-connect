
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTable, AddMaterialForm } from '..';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
      {/* Materials Table - Highlighted as the main component */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#0485ea]">Work Order Materials</h2>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Material
        </Button>
      </div>
      
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
      
      {/* Sheet/Slide-out panel for adding materials */}
      <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Material</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AddMaterialForm
              workOrderId={workOrderId}
              vendors={vendors}
              submitting={submitting}
              onMaterialPrompt={onMaterialPrompt}
              onVendorAdded={onVendorAdded}
              onSuccess={() => setShowAddForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MaterialsInfoSection;
