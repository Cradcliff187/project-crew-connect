
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface UploadSectionProps {
  workOrderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const UploadSection = ({ workOrderId, onSuccess, onCancel }: UploadSectionProps) => {
  return (
    <div className="mb-6">
      <EnhancedDocumentUpload 
        entityType={"WORK_ORDER" as EntityType}
        entityId={workOrderId}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
};

export default UploadSection;
