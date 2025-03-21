
import { Button } from '@/components/ui/button';
import { Eye, Receipt } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';

interface ReceiptButtonProps {
  material: WorkOrderMaterial;
  onClick: (material: WorkOrderMaterial) => void;
}

const ReceiptButton = ({ material, onClick }: ReceiptButtonProps) => {
  const hasReceipt = !!material.receipt_document_id;
  
  return (
    <Button
      variant={hasReceipt ? "outline" : "default"}
      size="sm"
      onClick={() => onClick(material)}
      className={`flex items-center gap-1 ${
        hasReceipt 
          ? 'text-green-600 hover:bg-green-50 border-green-300' 
          : 'bg-[#0485ea] text-white hover:bg-[#0375d1]'
      }`}
    >
      {hasReceipt ? <Eye className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
      {hasReceipt ? 'View Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
