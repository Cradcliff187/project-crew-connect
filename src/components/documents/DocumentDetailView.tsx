
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Calendar, User, Tag, Link } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import DocumentViewer from './DocumentViewer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import EntityInformation from './EntityInformation';
import DocumentVersionHistoryCard from './DocumentVersionHistoryCard';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  open,
  onClose,
  onDownload,
  onDelete,
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
          {/* Document Preview */}
          <div className="relative bg-gray-50 flex flex-col overflow-hidden border-r">
            <DialogHeader className="px-4 py-2 border-b bg-white">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#0485ea]" />
                <DialogTitle className="text-lg line-clamp-1">{document.file_name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                {formatFileSize(document.file_size || 0)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              <DocumentViewer 
                document={document}
                className="w-full h-full"
              />
            </div>
          </div>
          
          {/* Document Details */}
          <div className="bg-white p-6 overflow-y-auto flex flex-col">
            <h3 className="text-lg font-medium mb-4">Document Information</h3>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-sm">File Name</h4>
                    <p className="text-sm break-all">{document.file_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-sm">Date Added</h4>
                    <p className="text-sm">{formatDate(document.created_at)}</p>
                  </div>
                </div>
                
                {document.uploaded_by && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-sm">Uploaded By</h4>
                      <p className="text-sm">{document.uploaded_by}</p>
                    </div>
                  </div>
                )}
                
                {document.category && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-sm">Category</h4>
                      <DocumentCategoryBadge category={document.category} />
                    </div>
                  </div>
                )}
                
                <EntityInformation document={document} />
              </div>
              
              <Separator />
              
              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Version History */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center">
                  <Link className="h-4 w-4 mr-1" />
                  Version History
                </h4>
                
                {document.document_id && (
                  <DocumentVersionHistoryCard 
                    documentId={document.document_id} 
                  />
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <DialogFooter className="flex gap-2 flex-row">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                {onDelete && (
                  <Button
                    variant="outline"
                    onClick={onDelete}
                    className="flex-1 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
