
import React from 'react';
import { 
  FileText, 
  File, 
  Image, 
  Download, 
  Eye, 
  MoreVertical,
  Trash,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Document } from './schemas/documentSchema';

interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  loading,
  onViewDocument,
  onDeleteDocument
}) => {
  // Helper function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-12 w-12 text-muted-foreground" />;
    
    if (fileType.includes('image')) {
      return <Image className="h-12 w-12 text-muted-foreground" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-12 w-12 text-muted-foreground" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <Package className="h-12 w-12 text-muted-foreground" />;
    }
    
    return <File className="h-12 w-12 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-28 bg-muted flex items-center justify-center">
              <Skeleton className="h-12 w-12" />
            </div>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or upload a new document.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <Card 
          key={doc.document_id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewDocument(doc)}
        >
          <div className="h-28 bg-muted flex items-center justify-center">
            {doc.file_type?.includes('image') && doc.url ? (
              <img 
                src={doc.url} 
                alt={doc.file_name}
                className="h-full w-full object-cover"
              />
            ) : (
              getFileIcon(doc.file_type)
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">{doc.file_name}</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onViewDocument(doc);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    window.open(doc.url, '_blank');
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {onDeleteDocument && (
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(doc.created_at)} • {doc.file_size ? formatFileSize(doc.file_size) : '—'}
            </p>
            {doc.category && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded-md bg-[#0485ea]/10 text-[#0485ea] capitalize">
                  {doc.category.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentGrid;
