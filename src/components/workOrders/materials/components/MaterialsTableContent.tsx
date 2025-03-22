
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
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
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-[#0485ea]/10">
          <TableRow>
            <TableHead className="font-semibold text-[#0485ea]">Material</TableHead>
            <TableHead className="font-semibold text-[#0485ea]">Vendor</TableHead>
            <TableHead className="font-semibold text-[#0485ea]">Quantity</TableHead>
            <TableHead className="font-semibold text-[#0485ea]">Unit Price</TableHead>
            <TableHead className="font-semibold text-[#0485ea]">Total</TableHead>
            <TableHead className="text-right font-semibold text-[#0485ea]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.length > 0 ? (
            materials.map((material) => (
              <MaterialTableRow
                key={material.id}
                material={material}
                vendorName={getVendorName(material.vendor_id)}
                onDelete={onDelete}
                onReceiptClick={onReceiptClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="rounded-full bg-gray-100 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M5 8h14M5 12h14M12 16h7"/>
                    </svg>
                  </div>
                  <p className="font-medium">No materials have been added</p>
                  <p className="text-sm">Click the 'Add Material' button to track materials used in this work order.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaterialsTableContent;
