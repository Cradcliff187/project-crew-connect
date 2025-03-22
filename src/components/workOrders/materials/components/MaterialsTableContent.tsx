
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
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return '-';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <MaterialsTableHeader />
        <MaterialsTableBody 
          materials={materials} 
          vendorNameFn={getVendorName} 
          onDelete={onDelete} 
          onReceiptClick={onReceiptClick}
        />
      </Table>
    </div>
  );
};

export default MaterialsTableContent;
