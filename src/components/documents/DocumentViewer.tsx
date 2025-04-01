
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, File, X, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Document } from './schemas/documentSchema';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentVersionHistory from './DocumentVersionHistory';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionChange?: (document: Document) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  onVersionChange
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [error, setError] = useState<string | null>(null);
  
  // Reset error and tab when document changes
  useEffect(() => {
    setError(null);
    setActiveTab('preview');
  }, [document]);
  
  if (!document) {
    return null;
  }
  
  const handleError = () => {
    setError('Failed to load document preview.');
  };
  
  const determineDisplayType = () => {
    const fileType = document.file_type?.toLowerCase() || '';
    
    if (fileType.includes('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  };
  
  const getDocumentIcon = () => {
    switch (determineDisplayType()) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-blue-400" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-400" />;
      default:
        return <File className="h-10 w-10 text-[#0485ea]" />;
    }
  };
  
  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast({
        title: 'Download error',
        description: 'Document URL is not available',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{document.file_name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {document.document_id && (
              <TabsTrigger value="versions">Version History</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 mt-0 p-0">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{determineDisplayType()}</Badge>
                  {document.category && (
                    <Badge variant="secondary">{document.category}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50 p-4 rounded-md">
                {error ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FileText className="h-20 w-20 text-gray-300 mb-4" />
                    <p className="text-muted-foreground text-center">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download instead
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {determineDisplayType() === 'image' && document.url ? (
                      <img 
                        src={document.url} 
                        alt={document.file_name} 
                        className="max-h-full max-w-full object-contain"
                        onError={handleError}
                      />
                    ) : determineDisplayType() === 'pdf' && document.url ? (
                      <iframe 
                        src={document.url} 
                        className="w-full h-full"
                        title={document.file_name}
                        onError={handleError}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getDocumentIcon()}
                        <p className="text-muted-foreground mt-4">
                          This file type cannot be previewed
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download file
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="flex-1 mt-0 overflow-auto">
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">File Information</h3>
                  <div className="text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">File Name</span>
                      <span className="font-medium">{document.file_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">File Type</span>
                      <span className="font-medium">{document.file_type || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">
                        {document.file_size ? formatFileSize(document.file_size) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="font-medium">{formatDate(document.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Entity Information</h3>
                  <div className="text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{document.category || 'Uncategorized'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Entity Type</span>
                      <span className="font-medium capitalize">
                        {document.entity_type?.toLowerCase().replace('_', ' ') || 'None'}
                      </span>
                    </div>
                    {document.entity_id && document.entity_type && (
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Entity ID</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{document.entity_id}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            asChild
                          >
                            <a href={`/${document.entity_type.toLowerCase()}s/${document.entity_id}`} target="_blank">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {document.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <div className="p-3 bg-white rounded border text-sm">
                    {document.notes}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="versions" className="flex-1 mt-0">
            {document.document_id && (
              <DocumentVersionHistory 
                documentId={document.document_id}
                onVersionChange={onVersionChange}
                trigger={undefined}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
