
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Document } from './schemas/documentSchema';
import { Download, FileText, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DocumentVersionHistory from './DocumentVersionHistory';
import { getCategoryConfig } from './utils/categoryIcons';
import { Badge } from '@/components/ui/badge';

interface DocumentViewerDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionChange?: (document: Document) => void;
  title?: string;
  description?: string;
}

const DocumentViewerDialog: React.FC<DocumentViewerDialogProps> = ({
  document,
  open,
  onOpenChange,
  onVersionChange,
  title,
  description
}) => {
  if (!document) return null;
  
  // Improved file type detection
  const isImage = document.file_type?.toLowerCase().startsWith('image/');
  // Check for both 'pdf' in file_type and '.pdf' in file_name for better detection
  const isPdf = document.file_type?.toLowerCase().includes('pdf') || 
                (document.file_name?.toLowerCase().endsWith('.pdf'));
  
  // Use url property with fallback to file_url for compatibility
  const fileUrl = document.url || document.file_url || '';
  
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };
  
  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Get category styling info if available
  const categoryInfo = document.category ? getCategoryConfig(document.category) : null;
  const CategoryIcon = categoryInfo?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="font-medium truncate">
            {title || document.file_name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {document.document_id && (
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
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-[60vh] bg-gray-50 rounded-md flex items-center justify-center">
          {isImage && fileUrl ? (
            <img 
              src={fileUrl} 
              alt={document.file_name} 
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-[60vh]"
              title={document.file_name}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Preview not available for this file type
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleDownload}
              >
                Open in new tab
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <div className="w-full flex justify-between items-center text-sm text-gray-500">
            <div className="space-y-1">
              <p><strong>Uploaded:</strong> {formatDate(document.created_at || '')}</p>
              <p><strong>Size:</strong> {formatFileSize(document.file_size)}</p>
              {document.version && (
                <p><strong>Version:</strong> {document.version}</p>
              )}
              {document.category && categoryInfo && (
                <Badge 
                  className="flex items-center gap-1 text-xs px-2 py-0.5 font-medium mt-1" 
                  style={{ 
                    backgroundColor: categoryInfo.bgColor, 
                    color: categoryInfo.color 
                  }}
                >
                  {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                  <span>{categoryInfo.label}</span>
                </Badge>
              )}
            </div>
            <div className="text-right">
              {document.entity_type && (
                <p><strong>Associated with:</strong> {document.entity_type.replace('_', ' ').toLowerCase()}</p>
              )}
              {document.notes && (
                <p><strong>Notes:</strong> {document.notes}</p>
              )}
              {description && (
                <p>{description}</p>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
