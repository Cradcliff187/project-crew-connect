import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { useVendorDocuments } from './hooks/useVendorDocuments';
import DocumentCard from '../../workOrders/details/DocumentsList/DocumentCard';
import DocumentViewer from '../../workOrders/details/DocumentsList/DocumentViewer';
import { VendorDocument } from './types';

interface VendorDocumentsProps {
  vendorId: string;
}

const VendorDocuments = ({ vendorId }: VendorDocumentsProps) => {
  const { documents, loading, fetchDocuments } = useVendorDocuments(vendorId);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<VendorDocument | null>(null);
  
  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    fetchDocuments();
  };
  
  const handleViewDocument = (doc: VendorDocument) => {
    setViewDocument(doc);
  };
  
  // Convert vendor document to work order document format for compatibility
  const convertToWorkOrderDocument = (doc: VendorDocument) => {
    return {
      ...doc,
      entity_id: doc.entity_id, // This is now required by the type definition
      entity_type: doc.entity_type, // This is now required by the type definition
      updated_at: doc.updated_at, // This is now required by the type definition
      url: doc.url || '',
      storage_path: doc.storage_path,
      file_type: doc.file_type || ''
    };
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
                document={convertToWorkOrderDocument(doc)}
                onViewDocument={() => handleViewDocument(doc)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No documents have been attached to this vendor</p>
            <Button 
              variant="outline" 
              className="mt-4 text-[#0485ea]"
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
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
            entityType={"VENDOR" as EntityType}
            entityId={vendorId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setIsUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!viewDocument} onOpenChange={(open) => !open && setViewDocument(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewDocument?.file_name}</DialogTitle>
          </DialogHeader>
          {viewDocument && (
            <DocumentViewer 
              document={convertToWorkOrderDocument(viewDocument)}
              open={!!viewDocument}
              onOpenChange={(open) => !open && setViewDocument(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VendorDocuments;
