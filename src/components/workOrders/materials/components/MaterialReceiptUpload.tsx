
import { formatCurrency } from '@/lib/utils';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { WorkOrderMaterial } from '@/types/workOrder';

interface MaterialReceiptUploadProps {
  workOrderId: string;
  material: WorkOrderMaterial;
  vendorName: string;
  onSuccess: (documentId: string) => void;
  onCancel: () => void;
}

const MaterialReceiptUpload = ({ 
  workOrderId, 
  material, 
  vendorName,
  onSuccess, 
  onCancel 
}: MaterialReceiptUploadProps) => {
  return (
    <div className="py-2">
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Material</p>
            <p className="text-sm">{material.material_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vendor</p>
            <p className="text-sm">{vendorName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="text-sm">{formatCurrency(material.total_price)}</p>
          </div>
        </div>
      </div>
      
      <EnhancedDocumentUpload 
        entityType={"WORK_ORDER" as EntityType}
        entityId={workOrderId}
        onSuccess={(documentId: string) => {
          if (documentId) {
            onSuccess(documentId);
          }
        }}
        onCancel={onCancel}
        isReceiptUpload={true}
        prefillData={{
          amount: material.total_price,
          vendorId: material.vendor_id || undefined,
          materialName: material.material_name
        }}
      />
    </div>
  );
};

export default MaterialReceiptUpload;
