import React from 'react';
import { Document } from './schemas/documentSchema';
import { FileText, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DocumentsDataTableProps {
  documents: Document[];
  isLoading: boolean;
  emptyMessage?: string;
  getActions?: (
    document: Document
  ) => Array<{ icon: React.ReactNode; label: string; onClick: () => void }>;
}

const DocumentsDataTable: React.FC<DocumentsDataTableProps> = ({
  documents,
  isLoading,
  emptyMessage = 'No documents found',
  getActions,
}) => {
  // Format file size
  const formatFileSize = (bytes: number) => {
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

  // Helper to get document category display name
  const getCategoryDisplay = (category: string) => {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-md mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded-md mb-2"></div>
          <div className="h-3 w-24 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg mb-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(document => (
            <TableRow key={document.document_id || document.file_name}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate max-w-[240px]">{document.file_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {getCategoryDisplay(document.category)}
                </Badge>
              </TableCell>
              <TableCell>{formatFileSize(document.file_size || 0)}</TableCell>
              <TableCell>
                {document.created_at
                  ? format(new Date(document.created_at), 'MMM d, yyyy')
                  : 'Unknown'}
              </TableCell>
              <TableCell className="text-right">
                {getActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getActions(document).map((action, index) => (
                        <DropdownMenuItem key={index} onClick={action.onClick}>
                          <span className="mr-2">{action.icon}</span>
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsDataTable;
