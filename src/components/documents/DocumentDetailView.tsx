
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Trash, Tag, Calendar, FileText, File } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DocumentViewer from './DocumentViewer';
import EntityInformation from './EntityInformation';
import DocumentVersionHistoryCard from './DocumentVersionHistoryCard';
import { DocumentCategoryBadge } from './utils/categoryIcons';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  open,
  onClose,
  onDelete
}) => {
  if (!document) return null;

  // Determine icon based on file type
  const getFileIcon = () => {
    if (document.file_type?.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />;
    }
    if (document.file_type?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getFileIcon()}
                <DialogTitle className="text-xl">{document.file_name}</DialogTitle>
                {document.category && (
                  <DocumentCategoryBadge category={document.category} />
                )}
              </div>
              <DialogDescription className="mt-1">
                {document.file_size && `${(document.file_size / 1024).toFixed(1)} KB`} • 
                Added on {formatDate(document.created_at)}
              </DialogDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-[#0485ea] border-[#0485ea]/30"
                asChild
              >
                <a href={document.url} download={document.file_name} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
              
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive/30"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 mt-4 overflow-hidden">
          {/* Main preview area */}
          <div className="flex-1 overflow-hidden">
            <DocumentViewer document={document} embedded />
          </div>
          
          {/* Side panel with information */}
          <div className="w-full md:w-64 space-y-6 overflow-y-auto pb-4">
            {/* Entity Information */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Association</h3>
              <EntityInformation document={document} />
            </div>
            
            <Separator />
            
            {/* Metadata */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Document Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <dt className="font-medium">Created:</dt>
                  <dd>{formatDate(document.created_at)}</dd>
                </div>
                
                {document.updated_at && document.updated_at !== document.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <dt className="font-medium">Updated:</dt>
                    <dd>{formatDate(document.updated_at)}</dd>
                  </div>
                )}
                
                {document.tags && document.tags.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <dt className="font-medium">Tags:</dt>
                    <dd className="flex flex-wrap gap-1">
                      {document.tags.map(tag => (
                        <span key={tag} className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            <Separator />
            
            {/* Document Notes */}
            {document.notes && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {document.notes}
                </p>
              </div>
            )}
            
            <Separator />
            
            {/* Version history */}
            {document.document_id && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Version History</h3>
                <DocumentVersionHistoryCard 
                  documentId={document.document_id}
                  minimal
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
