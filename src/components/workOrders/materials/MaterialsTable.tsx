
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTableContent } from './components';

interface MaterialsTableProps {
  materials: WorkOrderMaterial[];
  loading: boolean;
  vendors: { vendorid: string, vendorname: string }[];
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
  onReceiptClick
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
    <div className="space-y-4">
      <div className="font-medium text-base">Materials</div>
      
      <MaterialsTableContent 
        materials={materials} 
        vendors={vendors} 
        onDelete={onDelete}
        onReceiptClick={onReceiptClick}
      />
      
      {materials.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-gray-100 px-4 py-2 rounded flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Total Materials Cost:</span>
            <span className="text-sm font-bold">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsTable;
