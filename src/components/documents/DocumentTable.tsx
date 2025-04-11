
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Document } from './schemas/documentSchema';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { DocumentCategoryBadge } from './utils/categoryIcons';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  emptyMessage?: string;
  selectedDocuments?: string[];
  onToggleSelection?: (documentId: string) => void;
  showEntityInfo?: boolean;
  showCategories?: boolean;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  onViewDocument,
  onDocumentDelete,
  emptyMessage = "No documents found",
  selectedDocuments = [],
  onToggleSelection,
  showEntityInfo = false,
  showCategories = true,
}) => {
  // Format file size for display
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {onToggleSelection && (
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead>Name</TableHead>
            {showCategories && <TableHead>Category</TableHead>}
            {showEntityInfo && <TableHead>Entity</TableHead>}
            <TableHead>Size</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.document_id}>
              {onToggleSelection && (
                <TableCell>
                  <Checkbox
                    checked={selectedDocuments.includes(doc.document_id)}
                    onCheckedChange={() => onToggleSelection(doc.document_id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">{doc.file_name}</span>
                </div>
              </TableCell>
              {showCategories && (
                <TableCell>
                  {doc.category && <DocumentCategoryBadge category={doc.category} />}
                </TableCell>
              )}
              {showEntityInfo && (
                <TableCell className="capitalize">
                  {doc.entity_type.toLowerCase().replace('_', ' ')}
                </TableCell>
              )}
              <TableCell>{formatFileSize(doc.file_size)}</TableCell>
              <TableCell>{formatDate(doc.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(doc)}
                  >
                    View
                  </Button>
                  {onDocumentDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDocumentDelete(doc)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      Delete
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
