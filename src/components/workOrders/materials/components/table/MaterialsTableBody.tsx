
import { TableBody } from '@/components/ui/table';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialTableRow } from '../';
import EmptyState from './EmptyState';

interface MaterialsTableBodyProps {
  materials: WorkOrderMaterial[];
  vendorNameFn: (vendorId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsTableBody = ({
  materials,
  vendorNameFn,
  onDelete,
  onReceiptClick
}: MaterialsTableBodyProps) => {
  if (materials.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <TableBody>
      {materials.map((material) => (
        <MaterialTableRow
          key={material.id}
          material={material}
          vendorName={vendorNameFn(material.vendor_id)}
          onDelete={onDelete}
          onReceiptClick={onReceiptClick}
        />
      ))}
    </TableBody>
  );
};

export default MaterialsTableBody;
