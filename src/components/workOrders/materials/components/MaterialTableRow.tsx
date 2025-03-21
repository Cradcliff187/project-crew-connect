
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';

interface MaterialTableRowProps {
  material: WorkOrderMaterial;
  vendorName: string;
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (material: WorkOrderMaterial) => void;
}

const MaterialTableRow = ({ 
  material, 
  vendorName, 
  onDelete, 
  onReceiptClick 
}: MaterialTableRowProps) => {
  return (
    <TableRow key={material.id}>
      <TableCell className="font-medium">{material.material_name}</TableCell>
      <TableCell>{vendorName}</TableCell>
      <TableCell>{material.quantity}</TableCell>
      <TableCell>{formatCurrency(material.unit_price)}</TableCell>
      <TableCell>{formatCurrency(material.total_price)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReceiptClick(material)}
            className="text-[#0485ea] hover:text-[#0375d1] hover:bg-blue-50 flex items-center"
          >
            <Receipt className="h-4 w-4 mr-1" />
            {material.receipt_document_id ? 'Update Receipt' : 'Add Receipt'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(material.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Delete Material"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default MaterialTableRow;
