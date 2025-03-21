
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ExternalLink, FileType, Upload, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Document } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Function to get document icon based on file type
  const getDocumentIcon = (fileType: string | null) => {
    if (!fileType) return <FileType className="h-5 w-5 text-[#0485ea]" />;
    
    if (fileType.includes('pdf')) {
      return <FileType className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileType className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileType className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileType className="h-5 w-5 text-emerald-500" />;
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return <FileType className="h-5 w-5 text-amber-500" />;
    }
    
    return <FileType className="h-5 w-5 text-[#0485ea]" />;
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const handleUploadSuccess = (documentId?: string) => {
    toast({
      title: "Document Uploaded",
      description: "The document has been successfully attached to this estimate.",
    });
    setShowUploadForm(false);
    setIsLoading(false);
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };
  
  const openDocument = (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL is not available",
        variant: "destructive"
      });
      return;
    }
    window.open(url, '_blank');
  };

  // Get badge color based on document category
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'subcontractor_estimate':
        return "bg-purple-100 text-purple-800";
      case 'vendor_quote':
        return "bg-blue-100 text-blue-800";
      case 'invoice':
        return "bg-green-100 text-green-800";
      case 'contract':
        return "bg-amber-100 text-amber-800";
      case 'insurance':
        return "bg-red-100 text-red-800";
      case 'certification':
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === 'subcontractor_estimate') return 'Subcontractor Estimate';
    if (category === 'vendor_quote') return 'Vendor Quote';
    
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  // Get vendor type display name
  const getVendorTypeDisplay = (vendorType: string) => {
    return vendorType === 'vendor' ? 'Vendor' : 
           vendorType === 'subcontractor' ? 'Subcontractor' : 
           vendorType.charAt(0).toUpperCase() + vendorType.slice(1);
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
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatDate(doc.created_at)} • {doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}
              </span>
              {doc.category && (
                <Badge className={getCategoryBadgeColor(doc.category)}>
                  {formatCategoryName(doc.category)}
                </Badge>
              )}
              {doc.vendor_id && doc.vendor_type && (
                <Badge variant="outline" className="border-[#0485ea] text-[#0485ea]">
                  {getVendorTypeDisplay(doc.vendor_type)}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#0485ea]"
            onClick={() => openDocument(doc.url || '')}
            disabled={!doc.url}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ))}
    </div>
  );

  const startUpload = () => {
    setShowUploadForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Documents</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={showUploadForm ? "text-red-500 border-red-200" : "text-[#0485ea] border-[#0485ea]"}
        >
          {showUploadForm ? (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Cancel Upload
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
            <span className="ml-2">Processing document...</span>
          </div>
        ) : showUploadForm ? (
          <EnhancedDocumentUpload 
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
            onStartUpload={() => setIsLoading(true)}
          />
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileType className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p>No documents attached to this estimate yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-[#0485ea]"
              onClick={startUpload}
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
                    {formatCategoryName(category)}
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
                        {getVendorTypeDisplay(type)}: {id}
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
