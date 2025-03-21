
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ExternalLink, FileType, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Document } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EstimateDocumentsTabProps {
  estimateId: string;
  documents?: Document[];
  onDocumentAdded?: () => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ 
  estimateId, 
  documents = [],
  onDocumentAdded
}) => {
  const [showUploadForm, setShowUploadForm] = React.useState(false);
  
  // Group documents by category for better organization
  const documentsByCategory = documents.reduce((acc: Record<string, Document[]>, doc) => {
    const category = doc.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});
  
  // Group by vendor/subcontractor
  const documentsByVendor = documents.reduce((acc: Record<string, Document[]>, doc) => {
    if (doc.vendor_id && doc.vendor_type) {
      const key = `${doc.vendor_type}-${doc.vendor_id}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(doc);
    }
    return acc;
  }, {});

  const getDocumentIcon = (fileType: string | null) => {
    if (!fileType) return <FileType className="h-5 w-5 text-[#0485ea]" />;
    
    if (fileType.includes('pdf')) {
      return <FileType className="h-5 w-5 text-[#0485ea]" />;
    }
    
    return <FileType className="h-5 w-5 text-[#0485ea]" />;
  };
  
  const handleUploadSuccess = (documentId?: string) => {
    toast({
      title: "Document Uploaded",
      description: "The document has been successfully attached to this estimate.",
    });
    setShowUploadForm(false);
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };
  
  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const renderDocumentList = (docs: Document[]) => (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.document_id} className="flex items-center p-3 border rounded-md bg-white hover:bg-blue-50 transition-colors">
          <div className="p-2 bg-blue-50 rounded-md mr-3">
            {getDocumentIcon(doc.file_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{doc.file_name}</h4>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {formatDate(doc.created_at)}
              </span>
              {doc.vendor_id && doc.vendor_type && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {doc.vendor_type === 'vendor' ? 'Vendor' : 'Subcontractor'}
                </span>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#0485ea]"
            onClick={() => openDocument(doc.url || '')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Documents</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="text-[#0485ea] border-[#0485ea]"
        >
          <Upload className="h-4 w-4 mr-1" />
          {showUploadForm ? 'Cancel Upload' : 'Upload Document'}
        </Button>
      </CardHeader>
      <CardContent>
        {showUploadForm ? (
          <EnhancedDocumentUpload 
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileType className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>No documents attached to this estimate yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-[#0485ea]"
              onClick={() => setShowUploadForm(true)}
            >
              Upload your first document
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="category">
            <TabsList className="mb-4">
              <TabsTrigger value="category">By Category</TabsTrigger>
              {Object.keys(documentsByVendor).length > 0 && (
                <TabsTrigger value="vendor">By Supplier/Subcontractor</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="category" className="space-y-6">
              {Object.entries(documentsByCategory).map(([category, docs]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium mb-2">
                    {category === 'subcontractor_estimate' ? 'Subcontractor Estimates' : 
                     category === 'vendor_quote' ? 'Vendor Quotes' : 
                     category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </h3>
                  {renderDocumentList(docs)}
                </div>
              ))}
            </TabsContent>
            
            {Object.keys(documentsByVendor).length > 0 && (
              <TabsContent value="vendor" className="space-y-6">
                {Object.entries(documentsByVendor).map(([vendorKey, docs]) => {
                  const [type, id] = vendorKey.split('-');
                  return (
                    <div key={vendorKey}>
                      <h3 className="text-sm font-medium mb-2">
                        {type === 'vendor' ? 'Vendor: ' : 'Subcontractor: '}
                        {id}
                      </h3>
                      {renderDocumentList(docs)}
                    </div>
                  );
                })}
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
