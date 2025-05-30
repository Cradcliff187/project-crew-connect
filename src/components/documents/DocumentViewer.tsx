import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [imageError, setImageError] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (!document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  const handleDownload = () => {
    if (!document?.url) return;

    // Open the signed URL directly for download
    window.open(document.url, '_blank');
  };

  const handleImageError = () => {
    console.error('Image failed to load:', document.url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageError(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden flex flex-col',
          viewerAnimations.content
        )}
      >
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-[#0485ea]">
              {document.file_name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            View and manage document {document.file_name}
          </DialogDescription>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <div>Type: {document.file_type || 'Unknown'}</div>
              <div>Size: {formatFileSize(document.file_size || 0)}</div>
            </div>
            <div className="sm:ml-auto text-sm text-gray-500">
              Uploaded: {formatDate(document.created_at)}
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="preview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mb-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {document.version && document.version > 1 && (
              <TabsTrigger value="versions">Versions</TabsTrigger>
            )}
            {relatedDocuments.length > 0 && (
              <TabsTrigger value="related">Related ({relatedDocuments.length})</TabsTrigger>
            )}
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent
            value="preview"
            className="flex-1 overflow-auto bg-gray-50 min-h-[400px] flex items-center justify-center m-0"
          >
            {isImage ? (
              imageError ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-16 w-16 text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-red-600">Image Failed to Load</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md">
                    The image could not be loaded. Try downloading it instead.
                  </p>
                  <Button onClick={handleDownload} className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={document.url}
                    alt={document.file_name}
                    className="max-w-full max-h-[65vh] object-contain"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ display: 'block' }}
                  />
                </div>
              )
            ) : isPdf ? (
              <iframe
                src={document.url}
                title={document.file_name}
                className="w-full h-full min-h-[500px]"
              />
            ) : (
              <div
                className={cn(
                  'flex flex-col items-center justify-center p-6 text-center',
                  viewerAnimations.content
                )}
              >
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Preview not available</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  This file type can't be previewed. Please download the file to view its contents.
                </p>
                <Button onClick={handleDownload} className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="flex-1 overflow-auto bg-white p-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Version History</h3>
              <p className="text-sm text-muted-foreground">
                Version {document.version || 1}
                {document.is_latest_version ? ' (Latest)' : ''}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="related" className="flex-1 overflow-auto bg-white p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-3">Related Documents</h3>

              {relatedDocuments.map(doc => (
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

          <TabsContent value="details" className="flex-1 overflow-auto bg-white p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Document Details</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">File name:</span>
                        <span className="text-sm font-medium text-gray-900 break-all max-w-[60%] text-right">
                          {document.file_name}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">File type:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {document.file_type || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Size:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatFileSize(document.file_size || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Uploaded:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(document.created_at)}
                        </span>
                      </div>
                      {document.version && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Version:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {document.version}
                            {document.is_latest_version && (
                              <span className="ml-2 text-xs text-green-600">(Latest)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Associated Information Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Associated Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Entity type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {document.entity_type?.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      {document.entity_id && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">
                            {document.entity_type === 'PROJECT' ? 'Project:' : 'Entity ID:'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {document.entity_type === 'PROJECT' && (document as any).project_name
                              ? (document as any).project_name
                              : document.entity_id}
                          </span>
                        </div>
                      )}
                      {document.entity_type === 'PROJECT' && (document as any).customer_id && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Customer ID:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(document as any).customer_id}
                          </span>
                        </div>
                      )}
                      {document.category && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Category:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {document.category?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                      {document.is_expense !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Is Expense:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {document.is_expense ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {document.expense_date && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Expense Date:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(document.expense_date)}
                          </span>
                        </div>
                      )}
                      {document.amount !== null && document.amount !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${document.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {document.vendor_id && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Vendor ID:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {document.vendor_id}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              {(document.notes || document.tags?.length > 0) && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {document.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {document.notes}
                      </p>
                    </div>
                  )}
                  {document.tags && document.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-4 border-t">
          <div className="flex w-full justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {document.version && document.version > 1 && (
                <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}

              {document.version && !document.is_latest_version && (
                <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onShare && (
                <Button variant="outline" size={isMobile ? 'sm' : 'default'} onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}

              <Button
                onClick={handleDownload}
                size={isMobile ? 'sm' : 'default'}
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
