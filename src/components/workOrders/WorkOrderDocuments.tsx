
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: EntityType;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Documents</CardTitle>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              Upload work order related documents such as:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Customer approvals</li>
              <li>Photos of the work performed</li>
              <li>Material receipts</li>
              <li>Inspection reports</li>
              <li>Signed completion forms</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
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
            entityType={entityType} 
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
