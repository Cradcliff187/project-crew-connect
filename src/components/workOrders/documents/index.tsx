
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentsCard from './DocumentsCard';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
  onDocumentAdded?: () => void;
}

const WorkOrderDocuments = ({ workOrderId, entityType, onDocumentAdded }: WorkOrderDocumentsProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { refreshTrigger, handleRefresh } = useWorkOrderDocumentsEmbed();
  
  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    handleRefresh();
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };
  
  return (
    <div className="space-y-6">
      <DocumentsCard onUploadClick={() => setIsUploadOpen(true)} />
      
      <iframe 
        src={`/Documents?entityId=${workOrderId}&entityType=${entityType}&embed=true&refreshTrigger=${refreshTrigger}`}
        className="w-full h-[300px] border rounded-md"
      />
      
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload 
            entityType={"WORK_ORDER" as EntityType}
            entityId={workOrderId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setIsUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrderDocuments;
