
import React from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Calendar, 
  FileText, 
  Tag,
  LinkIcon,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Document } from './schemas/documentSchema';
import DocumentViewer from './DocumentViewer';
import EntityInformation from './EntityInformation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useScreenSize } from '@/hooks/use-screen-size';
import RelatedDocuments from './RelatedDocuments';
import NavigateToEntityButton from './NavigateToEntityButton';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (document: Document) => void;
  onViewRelatedDocument?: (document: Document) => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  open,
  onClose,
  onDelete,
  onViewRelatedDocument
}) => {
  const { isMobile } = useScreenSize();
  
  const handleDownload = () => {
    if (!document?.url) return;
    
    // Use window API instead of document reference
    const a = window.document.createElement('a');
    a.href = document.url;
    a.download = document.file_name || 'document';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };
  
  if (!document) return null;
  
  const showMetadata = Boolean(
    document.tags?.length || 
    document.category || 
    document.notes
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? "w-[95vw] max-w-full" : "sm:max-w-[900px] max-h-[90vh]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-[#0485ea]">
            <FileText className="h-5 w-5 mr-2" />
            <span className="truncate">{document.file_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* Document Preview */}
          <div className="flex-1 min-h-[300px] md:max-h-[500px] overflow-hidden flex flex-col">
            <DocumentViewer 
              document={document} 
              open={true} 
              onOpenChange={() => {}}
            />
          </div>
          
          {/* Document Details */}
          <div className="w-full md:w-80 flex flex-col">
            <ScrollArea className="flex-1 pr-4 max-h-[500px]">
              {/* Entity Link */}
              {document.entity_id && document.entity_type && document.entity_id !== 'detached' && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Related To</h3>
                  <div className="bg-muted rounded-md p-3">
                    <EntityInformation document={document} />
                  </div>
                </div>
              )}
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Document Information</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="text-muted-foreground">Type:</div>
                    <div>{document.file_type || 'Unknown'}</div>
                    
                    <div className="text-muted-foreground">Size:</div>
                    <div>{formatFileSize(document.file_size || 0)}</div>
                    
                    <div className="text-muted-foreground">Uploaded:</div>
                    <div>{formatDate(document.created_at)}</div>
                    
                    {document.category && (
                      <>
                        <div className="text-muted-foreground">Category:</div>
                        <div className="capitalize">{document.category.replace(/_/g, ' ')}</div>
                      </>
                    )}
                    
                    {document.version && (
                      <>
                        <div className="text-muted-foreground">Version:</div>
                        <div>{document.version}</div>
                      </>
                    )}
                    
                    {document.is_expense && (
                      <>
                        <div className="text-muted-foreground">Type:</div>
                        <div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Receipt
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {document.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{document.notes}</p>
                  </div>
                )}
                
                {/* Related Documents */}
                <RelatedDocuments 
                  documentId={document.document_id || ''} 
                  onDocumentSelect={onViewRelatedDocument}
                />
              </div>
            </ScrollArea>
            
            <div className="mt-4 pt-4 space-y-2 border-t">
              <Button 
                onClick={handleDownload}
                className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              {onDelete && (
                <Button 
                  onClick={() => onDelete(document)}
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
