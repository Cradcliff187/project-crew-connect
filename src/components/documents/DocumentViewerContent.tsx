import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Share2, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getCategoryConfig } from './utils/categoryIcons';
import DocumentVersionHistory from './DocumentVersionHistory';

interface DocumentViewerContentProps {
  document: Document;
  relatedDocuments?: Document[];
  onViewRelatedDocument?: (document: Document) => void;
  onShare?: () => void;
  onVersionChange?: (document: Document) => void;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Base document viewer component without Dialog wrapper.
 * Use this when embedding document viewing inside an existing dialog.
 * For standalone document viewing, use DocumentViewerDialog instead.
 *
 * @example
 * // Inside an existing dialog
 * <DialogContent>
 *   <DocumentViewerContent document={doc} />
 * </DialogContent>
 */
const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  document,
  relatedDocuments = [],
  onViewRelatedDocument,
  onShare,
  onVersionChange,
  showHeader = true,
  showFooter = true,
}) => {
  const [activeTab, setActiveTab] = useState('preview');

  // File type detection
  const isImage = document.file_type?.toLowerCase().startsWith('image/');
  const isPdf =
    document.file_type?.toLowerCase().includes('pdf') ||
    document.file_name?.toLowerCase().endsWith('.pdf');

  // Use url property with fallback for compatibility
  const fileUrl = document.url || ('file_url' in document ? (document as any).file_url : '') || '';

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // Get category styling info if available
  const categoryInfo = document.category ? getCategoryConfig(document.category) : null;
  const CategoryIcon = categoryInfo?.icon;

  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0485ea]">{document.file_name}</h3>
            <div className="flex items-center gap-2">
              {document.document_id && onVersionChange && (
                <DocumentVersionHistory
                  documentId={document.document_id}
                  onVersionChange={onVersionChange}
                  trigger={
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Versions
                    </Button>
                  }
                />
              )}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <div>Type: {document.file_type || 'Unknown'}</div>
              <div>Size: {formatFileSize(document.file_size || 0)}</div>
              {document.version && <div>Version: {document.version}</div>}
              {categoryInfo && (
                <Badge
                  className="flex items-center gap-1 text-xs px-2 py-0.5 font-medium"
                  style={{
                    backgroundColor: categoryInfo.bgColor,
                    color: categoryInfo.color,
                  }}
                >
                  {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                  <span>{categoryInfo.label}</span>
                </Badge>
              )}
            </div>
            <div className="sm:ml-auto text-sm text-gray-500">
              Uploaded: {formatDate(document.created_at)}
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {relatedDocuments.length > 0 && (
            <TabsTrigger value="related">Related ({relatedDocuments.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preview" className="flex-1 p-4">
          {isImage && fileUrl ? (
            <img
              src={fileUrl}
              alt={document.file_name}
              className="max-w-full max-h-[60vh] object-contain mx-auto"
            />
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-[60vh]"
              title={document.file_name}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Preview not available for this file type</p>
              <Button variant="outline" className="mt-4" onClick={handleDownload}>
                Open in new tab
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Document Information</h4>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">File Name</dt>
                  <dd className="font-medium">{document.file_name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">File Type</dt>
                  <dd className="font-medium">{document.file_type || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="font-medium">{formatFileSize(document.file_size || 0)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Uploaded</dt>
                  <dd className="font-medium">{formatDate(document.created_at)}</dd>
                </div>
                {document.version && (
                  <div>
                    <dt className="text-gray-500">Version</dt>
                    <dd className="font-medium">{document.version}</dd>
                  </div>
                )}
                {document.entity_type && (
                  <div>
                    <dt className="text-gray-500">Associated With</dt>
                    <dd className="font-medium">
                      {document.entity_type.replace('_', ' ').toLowerCase()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            {document.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{document.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {relatedDocuments.length > 0 && (
          <TabsContent value="related" className="p-4">
            <div className="space-y-2">
              {relatedDocuments.map((relDoc, index) => (
                <div
                  key={relDoc.document_id || index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewRelatedDocument?.(relDoc)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{relDoc.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(relDoc.file_size || 0)} • {formatDate(relDoc.created_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showFooter && (
        <div className="p-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="space-y-1">
              {document.entity_type && (
                <p>
                  <strong>Associated with:</strong>{' '}
                  {document.entity_type.replace('_', ' ').toLowerCase()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewerContent;
