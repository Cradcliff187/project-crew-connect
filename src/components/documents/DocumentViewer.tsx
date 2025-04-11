
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, Share2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { viewerAnimations } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedDocuments?: Document[];
  onViewRelatedDocument?: (document: Document) => void;
  onShare?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  relatedDocuments = [],
  onViewRelatedDocument,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<string>('preview');
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (!document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';
  
  const handleDownload = () => {
    if (!document?.url) return;
    
    // Create a temporary anchor element to trigger download
    const a = window.document.createElement('a');
    a.href = document.url;
    a.download = document.file_name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden flex flex-col",
        viewerAnimations.content
      )}>
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-[#0485ea]">
              {document.file_name}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <div>Type: {document.file_type || 'Unknown'}</div>
              <div>Size: {formatFileSize(document.file_size || 0)}</div>
            </div>
            <div className="sm:ml-auto text-sm text-gray-500">
              Uploaded: {formatDate(document.created_at)}
            </div>
          </div>
          
          <Tabs
            defaultValue="preview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              {document.version && document.version > 1 && (
                <TabsTrigger value="versions">Versions</TabsTrigger>
              )}
              {relatedDocuments.length > 0 && (
                <TabsTrigger value="related">Related ({relatedDocuments.length})</TabsTrigger>
              )}
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>
        
        <TabsContent value="preview" className="flex-1 overflow-auto bg-gray-50 min-h-[400px] flex items-center justify-center">
          {isImage ? (
            <div className={cn("max-w-full max-h-[70vh] p-4", viewerAnimations.content)}>
              <img 
                src={document.url} 
                alt={document.file_name}
                className="max-w-full max-h-[65vh] object-contain mx-auto"
              />
            </div>
          ) : isPdf ? (
            <iframe 
              src={document.url}
              title={document.file_name}
              className="w-full h-full min-h-[500px]"
            />
          ) : (
            <div className={cn("flex flex-col items-center justify-center p-6 text-center", viewerAnimations.content)}>
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Preview not available</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                This file type can't be previewed. Please download the file to view its contents.
              </p>
              <Button
                onClick={handleDownload}
                className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="versions" className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white rounded-md shadow-sm p-4 animate-fade-in">
            <h3 className="text-sm font-medium mb-3">Version History</h3>
            <p className="text-sm text-muted-foreground">
              Version {document.version || 1} 
              {document.is_latest_version ? ' (Latest)' : ''}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="related" className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white rounded-md shadow-sm p-4 space-y-2 animate-fade-in">
            <h3 className="text-sm font-medium mb-3">Related Documents</h3>
            
            {relatedDocuments.map((doc) => (
              <div 
                key={doc.document_id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                onClick={() => onViewRelatedDocument && onViewRelatedDocument(doc)}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                </div>
              </div>
            ))}
            
            {relatedDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground">No related documents found.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white rounded-md shadow-sm p-4 animate-fade-in">
            <h3 className="text-sm font-medium mb-3">Document Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Basic Information</h4>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm flex justify-between">
                    <span>File name:</span>
                    <span className="font-medium">{document.file_name}</span>
                  </li>
                  <li className="text-sm flex justify-between">
                    <span>File type:</span>
                    <span className="font-medium">{document.file_type || 'Unknown'}</span>
                  </li>
                  <li className="text-sm flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatFileSize(document.file_size || 0)}</span>
                  </li>
                  <li className="text-sm flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{formatDate(document.created_at)}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Associated Information</h4>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm flex justify-between">
                    <span>Entity type:</span>
                    <span className="font-medium capitalize">{document.entity_type?.toLowerCase().replace('_', ' ')}</span>
                  </li>
                  {document.category && (
                    <li className="text-sm flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium capitalize">{document.category?.replace('_', ' ')}</span>
                    </li>
                  )}
                  {document.tags && document.tags.length > 0 && (
                    <li className="text-sm flex justify-between">
                      <span>Tags:</span>
                      <span className="font-medium">{document.tags.join(', ')}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <DialogFooter className="p-4 border-t">
          <div className="flex w-full justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {document.version && document.version > 1 && (
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
              
              {document.version && !document.is_latest_version && (
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {onShare && (
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={onShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              
              <Button
                onClick={handleDownload}
                size={isMobile ? "sm" : "default"}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
