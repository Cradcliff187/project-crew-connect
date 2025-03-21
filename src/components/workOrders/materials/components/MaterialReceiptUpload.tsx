
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { WorkOrderMaterial } from '@/types/workOrder';

interface MaterialReceiptUploadProps {
  workOrderId: string;
  material: WorkOrderMaterial;
  vendorName: string;
  onSuccess: (documentId: string) => void;
  onCancel: () => void;
}

const MaterialReceiptUpload: React.FC<MaterialReceiptUploadProps> = ({
  workOrderId,
  material,
  vendorName,
  onSuccess,
  onCancel
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Prefill data for receipt upload
  const prefillData = {
    amount: material.total_price,
    vendorId: material.vendor_id || undefined,
    materialName: material.material_name
  };

  console.log("MaterialReceiptUpload component rendering with:", { 
    workOrderId, 
    materialId: material.id,
    prefillData 
  });

  // Handle successful upload
  const handleSuccess = (documentId?: string) => {
    console.log("Document upload success, got ID:", documentId);
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
          entityType="WORK_ORDER"
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
