
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Document } from './schemas/documentSchema';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Eye, Trash2, Clock, FileType, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocumentCategoryIcon } from './utils/categoryIcons';

export interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  selectedDocuments?: string[];
  onToggleSelection?: (documentId: string) => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  showCategories?: boolean;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  onViewDocument,
  onDocumentDelete,
  selectedDocuments = [],
  onToggleSelection,
  emptyMessage = 'No documents found',
  showEntityInfo = false,
  showCategories = true,
}) => {
  // Handle document selection
  const isSelected = (documentId: string) => {
    return selectedDocuments.includes(documentId);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {onToggleSelection && (
              <TableHead className="w-[40px]">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead>Document</TableHead>
            {showCategories && <TableHead>Category</TableHead>}
            {showEntityInfo && <TableHead>Entity</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.document_id}
              className={isSelected(document.document_id) ? 'bg-blue-50' : undefined}
            >
              {onToggleSelection && (
                <TableCell className="p-2">
                  <Checkbox
                    checked={isSelected(document.document_id)}
                    onCheckedChange={() => onToggleSelection(document.document_id)}
                  />
                </TableCell>
              )}
              <TableCell onClick={() => onViewDocument(document)} className="cursor-pointer">
                <div className="flex items-center">
                  {getDocumentCategoryIcon(document.category || 'other')}
                  <span className="ml-2 font-medium">{document.file_name}</span>
                </div>
                {document.tags && document.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {document.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs px-1 py-0 h-4">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        +{document.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
              {showCategories && (
                <TableCell>
                  {document.category && (
                    <Badge variant="secondary">{document.category}</Badge>
                  )}
                </TableCell>
              )}
              {showEntityInfo && (
                <TableCell>
                  {document.entity_type}
                </TableCell>
              )}
              <TableCell className="text-muted-foreground text-sm">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(document.created_at)}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                <div className="flex items-center">
                  <FileType className="h-3 w-3 mr-1" />
                  {formatFileSize(document.file_size || 0)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewDocument(document)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  {onDocumentDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => onDocumentDelete(document)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
