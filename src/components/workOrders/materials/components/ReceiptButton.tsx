
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
      className="bg-[#0485ea] text-white hover:bg-[#0375d1] flex items-center gap-1"
    >
      <Receipt className="h-4 w-4" />
      {material.receipt_document_id ? 'Update Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
