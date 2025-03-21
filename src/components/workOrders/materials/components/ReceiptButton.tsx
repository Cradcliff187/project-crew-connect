
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
      variant={material.receipt_document_id ? "outline" : "default"}
      size="sm"
      onClick={() => onClick(material)}
      className={`flex items-center gap-1 ${
        material.receipt_document_id 
          ? 'text-green-600 hover:bg-green-50 border-green-300' 
          : 'bg-[#0485ea] text-white hover:bg-[#0375d1]'
      }`}
    >
      <Receipt className="h-4 w-4" />
      {material.receipt_document_id ? 'View Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
