
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface MaterialReceiptUploadProps {
  workOrderId: string;
  materialId: string;
  materialName: string;
  vendorId?: string;
  vendorName?: string;
  amount?: number;
  onSuccess: (documentId: string) => void;
  onCancel: () => void;
}

const MaterialReceiptUpload: React.FC<MaterialReceiptUploadProps> = ({
  workOrderId,
  materialId,
  materialName,
  vendorId,
  vendorName,
  amount,
  onSuccess,
  onCancel
}) => {
  // Prepare prefill data for the document upload
  const prefillData = {
    amount: amount,
    vendorId: vendorId,
    materialName: materialName,
    category: 'receipt',
    notes: `Receipt for ${materialName}${vendorName ? ` from ${vendorName}` : ''}`,
    tags: ['receipt', 'material', 'work_order_material'],
    budgetItemId: materialId
  };

  // Handle successful upload
  const handleSuccess = (documentId?: string) => {
    if (documentId) {
      onSuccess(documentId);
    } else {
      toast({
        title: "Error",
        description: "Failed to get document ID after upload",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-none border-0 p-0">
      <CardContent className="p-0">
        <EnhancedDocumentUpload
          entityType={EntityType.WORK_ORDER}
          entityId={workOrderId}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          isReceiptUpload={true}
          prefillData={prefillData}
        />
      </CardContent>
    </Card>
  );
};

export default MaterialReceiptUpload;
