import { TableRow, TableCell } from '@/components/ui/table';
import { Trash2, Upload, FileText, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

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
  onReceiptClick,
}: MaterialTableRowProps) => {
  // Define actions for the menu based on receipt status
  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: material.receipt_document_id ? 'View Receipt' : 'Upload Receipt',
          icon: material.receipt_document_id ? (
            <FileText className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          ),
          onClick: () => onReceiptClick(material),
          className: material.receipt_document_id
            ? 'text-green-600 hover:text-green-700'
            : 'text-[#0485ea] hover:text-[#0375d1]',
        },
        {
          label: 'Edit Material',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => console.log('Edit material:', material.id),
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
    {
      items: [
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(material.id),
          className: 'text-red-500 hover:text-red-700',
        },
      ],
    },
  ];

  return (
    <TableRow className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">{material.material_name}</TableCell>
      <TableCell>{vendorName}</TableCell>
      <TableCell>{material.quantity}</TableCell>
      <TableCell>{formatCurrency(material.unit_price)}</TableCell>
      <TableCell className="font-semibold">{formatCurrency(material.total_price)}</TableCell>
      <TableCell className="text-right">
        <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
      </TableCell>
    </TableRow>
  );
};

export default MaterialTableRow;
