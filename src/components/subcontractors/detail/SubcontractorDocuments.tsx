
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { useSubcontractorDocuments } from './hooks/useSubcontractorDocuments';
import DocumentCard from '../../workOrders/details/DocumentsList/DocumentCard';
import DocumentViewer from '../../workOrders/details/DocumentsList/DocumentViewer';
import { SubcontractorDocument } from './hooks/useSubcontractorDocuments';

interface SubcontractorDocumentsProps {
  subcontractorId: string;
}

const SubcontractorDocuments = ({ subcontractorId }: SubcontractorDocumentsProps) => {
  const { documents, loading, fetchDocuments } = useSubcontractorDocuments(subcontractorId);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<SubcontractorDocument | null>(null);
  
  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    fetchDocuments();
  };
  
  const handleViewDocument = (doc: SubcontractorDocument) => {
    setViewDocument(doc);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Documents</CardTitle>
          <Button 
            variant="outline" 
            className="text-[#0485ea]"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 animate-pulse bg-gray-100 rounded-md"></div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <DocumentCard 
                key={doc.document_id} 
                document={doc} 
                onViewDocument={() => handleViewDocument(doc)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No documents have been attached to this subcontractor</p>
            <Button 
              variant="outline" 
              className="mt-4 text-[#0485ea]"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </div>
        )}
      </CardContent>
      
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload 
            entityType={"SUBCONTRACTOR" as EntityType}
            entityId={subcontractorId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setIsUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {viewDocument && (
        <Dialog open={!!viewDocument} onOpenChange={(open) => !open && setViewDocument(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{viewDocument?.file_name}</DialogTitle>
            </DialogHeader>
            <DocumentViewer 
              document={viewDocument}
              open={!!viewDocument}
              onOpenChange={(open) => !open && setViewDocument(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default SubcontractorDocuments;
