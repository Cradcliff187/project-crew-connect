import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { cn } from '@/lib/utils';

interface ReceiptButtonProps {
  material: WorkOrderMaterial;
  onClick: (material: WorkOrderMaterial) => void;
  disabled?: boolean;
  className?: string;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({
  material,
  onClick,
  disabled,
  className,
}) => {
  // Determine if material has a receipt
  const hasReceipt = Boolean(material.receipt_document_id);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(material)}
      disabled={disabled}
      className={cn(
        'relative transition-colors duration-150 ease-in-out',
        hasReceipt
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
          : 'text-primary hover:text-primary/80 hover:bg-primary/10 border-primary/20',
        className
      )}
    >
      {hasReceipt ? (
        <>
          <FileText className="h-4 w-4 mr-1" />
          View Receipt
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-1" />
          Upload Receipt
        </>
      )}
    </Button>
  );
};

export default ReceiptButton;
