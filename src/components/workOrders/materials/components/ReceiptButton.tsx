
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
      variant={hasReceipt ? "outline" : "earth"}
      size="sm"
      onClick={() => onClick(material)}
      className={hasReceipt ? 'text-earth-600 border-earth-300 hover:bg-earth-50' : ''}
    >
      {hasReceipt ? <Eye className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
      {hasReceipt ? 'View Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
