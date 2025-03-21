
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import { ReceiptButton } from './';

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
    <TableRow>
      <TableCell>{material.material_name}</TableCell>
      <TableCell>{vendorName}</TableCell>
      <TableCell>{material.quantity}</TableCell>
      <TableCell>{formatCurrency(material.unit_price)}</TableCell>
      <TableCell>{formatCurrency(material.total_price)}</TableCell>
      <TableCell className="flex items-center justify-end gap-2">
        <ReceiptButton 
          material={material} 
          onClick={onReceiptClick} 
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(material.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default MaterialTableRow;
