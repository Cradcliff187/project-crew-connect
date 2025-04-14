import { Table } from '@/components/ui/table';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialsTableHeader, MaterialsTableBody } from './table';
import { Card, CardContent } from '@/components/ui/card';

interface MaterialsTableContentProps {
  materials: WorkOrderMaterial[];
  vendors: { vendorid: string; vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsTableContent = ({
  materials,
  vendors,
  onDelete,
  onReceiptClick,
}: MaterialsTableContentProps) => {
  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
};

export default MaterialsTableContent;
