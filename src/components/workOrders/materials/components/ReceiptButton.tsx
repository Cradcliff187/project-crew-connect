
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';

interface ReceiptButtonProps {
  material: WorkOrderMaterial;
  onClick: (material: WorkOrderMaterial) => void;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({ material, onClick }) => {
  // Determine if material has a receipt
  const hasReceipt = Boolean(material.receipt_document_id);
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(material)}
      className={
        hasReceipt
          ? "text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
          : "text-[#0485ea] hover:text-[#0485ea]/80 hover:bg-[#0485ea]/10 border-[#0485ea]/20"
      }
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
