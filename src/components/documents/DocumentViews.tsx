
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye, Filter, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DocumentCard from './DocumentCard';
import { formatDate } from '@/lib/utils';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  activeFiltersCount: number;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  onUploadClick: () => void;
}

export const DocumentViews = ({ 
  documents, 
  loading, 
  activeFiltersCount,
  onView, 
  onDelete,
  onUploadClick
}: DocumentViewsProps) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-[#0485ea]/10">
            <Filter className="h-10 w-10 text-[#0485ea]" />
          </div>
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-muted-foreground max-w-md">
            {activeFiltersCount > 0 
              ? "Try adjusting your filters or uploading new documents." 
              : "Upload your first document to get started."}
          </p>
          <Button 
            className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={onUploadClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
    );
  }
  
  const getDocumentActions = (document: Document): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => onView(document)
          },
          {
            label: 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: (e) => {
              if (document.url) {
                window.open(document.url, '_blank');
              }
            }
          }
        ]
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (e) => onDelete(document),
            className: 'text-destructive'
          }
        ]
      }
    ];
  };
  
  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {documents.map((document) => (
          <DocumentCard
            key={document.document_id}
            document={document}
            onView={() => onView(document)}
            onDelete={() => onDelete(document)}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.document_id}>
                <TableCell className="font-medium">{document.file_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {document.category || 'Other'}
                  </Badge>
                </TableCell>
                <TableCell>{document.entity_type.replace('_', ' ').toLowerCase()}</TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell className="text-right">
                  <ActionMenu groups={getDocumentActions(document)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default DocumentViews;
