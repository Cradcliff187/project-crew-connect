
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Document } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { useEstimateDetails } from '../hooks/useEstimateDetails';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface EstimateDocumentsTabProps {
  estimateId: string;
  itemDocuments?: Document[];
  onDocumentsUpdated?: () => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({
  estimateId,
  itemDocuments = [],
  onDocumentsUpdated
}) => {
  const [open, setOpen] = useState(false);
  const { fetchItemDocuments } = useEstimateDetails();

  const handleUploadSuccess = () => {
    toast({
      title: "Document uploaded",
      description: "The document has been successfully uploaded.",
    });
    setOpen(false);
    if (onDocumentsUpdated) {
      onDocumentsUpdated();
    }
    fetchItemDocuments(estimateId);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDelete = async (documentId: string) => {
    // Implement your delete logic here
    console.log(`Deleting document with ID: ${documentId}`);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Estimate Documents</CardTitle>
          <CardDescription>
            Manage documents associated with this estimate.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-6">
          <div className="grid gap-4">
            {itemDocuments && itemDocuments.length > 0 ? (
              itemDocuments.map((document) => {
                // Fix the property access 
                const entityType = document.vendor_id ? 'VENDOR' : 
                                   document.subcontractor_id ? 'SUBCONTRACTOR' : null;
                const entityId = document.vendor_id || document.subcontractor_id;

                return (
                  <div key={document.document_id} className="flex items-center justify-between">
                    <div>
                      {document.file_name} ({document.category})
                    </div>
                    <div>
                      {/* Conditionally render the delete button based on entityId and entityType */}
                      {entityId && entityType && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(document.document_id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No documents uploaded yet.</div>
            )}
            <Button onClick={() => setOpen(true)}>Add Document</Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="relative m-auto rounded-lg bg-white p-4 w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document related to this estimate.
            </DialogDescription>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleUploadSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimateDocumentsTab;
