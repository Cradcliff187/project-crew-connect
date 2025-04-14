import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { formatDate, formatFileSize } from '@/lib/utils';
import { FileIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { WorkOrderDocument } from './types';

interface DocumentsTableContentProps {
  documents: WorkOrderDocument[];
  loading: boolean;
  onViewDocument: (document: WorkOrderDocument) => void;
  onToggleUploadForm: () => void;
}

const DocumentsTableContent: React.FC<DocumentsTableContentProps> = ({
  documents,
  loading,
  onViewDocument,
  onToggleUploadForm,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        <p className="mt-4 text-sm text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FileIcon className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">No documents yet</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          No documents have been uploaded for this work order yet. Add documents such as contracts,
          photos, or receipts.
        </p>
        <Button onClick={onToggleUploadForm} className="mt-6 bg-[#0485ea] hover:bg-[#0375d1]">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Category</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map(doc => (
          <TableRow
            key={doc.document_id}
            className="cursor-pointer hover:bg-[#0485ea]/5"
            onClick={() => onViewDocument(doc)}
          >
            <TableCell className="font-medium">{doc.file_name}</TableCell>
            <TableCell>{doc.file_type?.toUpperCase() || 'UNKNOWN'}</TableCell>
            <TableCell>{formatFileSize(doc.file_size || 0)}</TableCell>
            <TableCell>{formatDate(doc.created_at)}</TableCell>
            <TableCell>
              {doc.is_receipt ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Receipt
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {doc.category || 'Document'}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                className="text-[#0485ea] hover:bg-[#0485ea]/10 hover:text-[#0485ea]"
                onClick={e => {
                  e.stopPropagation();
                  onViewDocument(doc);
                }}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentsTableContent;
