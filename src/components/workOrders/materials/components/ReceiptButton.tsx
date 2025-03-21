
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';

interface ReceiptButtonProps {
  material: WorkOrderMaterial;
  onClick: (material: WorkOrderMaterial) => void;
}

const ReceiptButton = ({ material, onClick }: ReceiptButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(material)}
      className="text-[#0485ea] hover:text-[#0375d1] hover:bg-blue-50 flex items-center"
    >
      <Receipt className="h-4 w-4 mr-1" />
      {material.receipt_document_id ? 'Update Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
