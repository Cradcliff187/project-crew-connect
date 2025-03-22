
import { TableBody } from '@/components/ui/table';
import { WorkOrderMaterial } from '@/types/workOrder';
import MaterialTableRow from '../MaterialTableRow';
import EmptyState from './EmptyState';

interface MaterialsTableBodyProps {
  materials: WorkOrderMaterial[];
  vendors: { vendorid: string, vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialsTableBody = ({ 
  materials, 
  vendors, 
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
          vendorName={
            material.vendor_id 
              ? (vendors.find(v => v.vendorid === material.vendor_id)?.vendorname || 'Unknown Vendor')
              : ''
          }
          onDelete={onDelete}
          onReceiptClick={onReceiptClick}
        />
      ))}
    </TableBody>
  );
};

export default MaterialsTableBody;
