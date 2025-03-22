
import { Table } from '@/components/ui/table';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTableHeader, MaterialsTableBody } from './table';

interface MaterialsTableContentProps {
  materials: WorkOrderMaterial[];
  vendors: { vendorid: string, vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsTableContent = ({
  materials,
  vendors,
  onDelete,
  onReceiptClick
}: MaterialsTableContentProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <MaterialsTableHeader />
        <MaterialsTableBody 
          materials={materials} 
          vendors={vendors} 
          onDelete={onDelete} 
          onReceiptClick={onReceiptClick}
        />
      </Table>
    </div>
  );
};

export default MaterialsTableContent;
