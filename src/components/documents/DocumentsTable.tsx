
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  File, 
  Image, 
  Package, 
  MoreVertical, 
  Eye,
  Download,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatFileSize } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Document } from './schemas/documentSchema';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentsTableProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  loading,
  onViewDocument,
  onDeleteDocument
}) => {
  // Helper function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.includes('image')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <Package className="h-4 w-4" />;
    }
    
    return <File className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.document_id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDocument(doc)}>
                <TableCell>
                  <div className="flex items-center">
                    {getFileIcon(doc.file_type)}
                    <span className="ml-2 truncate max-w-[150px]">{doc.file_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{doc.category ? doc.category.replace(/_/g, ' ') : '—'}</span>
                </TableCell>
                <TableCell>{doc.file_size ? formatFileSize(doc.file_size) : '—'}</TableCell>
                <TableCell>{formatDate(doc.created_at)}</TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;
