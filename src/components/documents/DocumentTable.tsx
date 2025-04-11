
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Eye, Trash2, File, FileText, FileImage, FilePdf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
  showEntityInfo?: boolean;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  onViewDocument,
  onDeleteDocument,
  showEntityInfo = false,
}) => {
  if (loading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              {showEntityInfo && <TableHead>Entity</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                {showEntityInfo && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const getDocumentIcon = (document: Document) => {
    const fileType = document.file_type || '';
    
    if (fileType.includes('image')) {
      return <FileImage className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FilePdf className="h-4 w-4" />;
    } else if (fileType.includes('doc')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            {showEntityInfo && <TableHead>Entity</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showEntityInfo ? 5 : 4} className="text-center py-6 text-muted-foreground">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.document_id}>
                <TableCell className="flex items-center gap-2">
                  {getDocumentIcon(document)}
                  <span className="truncate max-w-xs">{document.file_name}</span>
                </TableCell>
                <TableCell>{document.category || '-'}</TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                {showEntityInfo && (
                  <TableCell>
                    {document.entity_type ? `${document.entity_type}: ${document.entity_id?.substring(0, 8)}` : '-'}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onViewDocument(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onDeleteDocument && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteDocument(document)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
