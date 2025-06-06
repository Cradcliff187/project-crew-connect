import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTableContent } from './materials/components';
import { Card, CardContent } from '@/components/ui/card';
import { Package2 } from 'lucide-react';

interface MaterialsTableProps {
  materials: WorkOrderMaterial[];
  loading: boolean;
  vendors: { vendorid: string; vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptUploaded: (materialId: string, documentId: string) => Promise<void>;
  totalCost: number;
  workOrderId: string;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsTable = ({
  materials,
  loading,
  vendors,
  onDelete,
  onReceiptUploaded,
  totalCost,
  workOrderId,
  onReceiptClick,
}: MaterialsTableProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardContent className="p-0">
        <MaterialsTableContent
          materials={materials}
          vendors={vendors}
          onDelete={onDelete}
          onReceiptClick={onReceiptClick}
        />

        {materials.length > 0 ? (
          <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <Package2 size={18} />
              <span className="font-medium">Total Items: {materials.length}</span>
            </div>
            <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total Materials Cost:</span>
              <span className="text-lg font-bold text-[#0485ea]">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MaterialsTable;
