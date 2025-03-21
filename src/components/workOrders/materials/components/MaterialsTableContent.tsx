
import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/components/ui/table';
import { WorkOrderMaterial } from '@/types/workOrder';
import { MaterialTableRow } from './';

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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <MaterialTableRow
              key={material.id}
              material={material}
              vendorName={getVendorName(material.vendor_id)}
              onDelete={onDelete}
              onReceiptClick={onReceiptClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaterialsTableContent;
