
import React from 'react';
import { Document } from '../schemas/documentSchema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Eye, Download, Trash2 } from 'lucide-react';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface DesktopDocumentTableProps {
  documents: Document[];
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DesktopDocumentTable: React.FC<DesktopDocumentTableProps> = ({ 
  documents, 
  onView, 
  onDelete 
}) => {
  const getDocumentActions = (document: Document): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => onView(document)
          },
          {
            label: 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: () => {
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
            onClick: () => onDelete(document),
            className: 'text-destructive'
          }
        ]
      }
    ];
  };

  return (
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
  );
};

export default DesktopDocumentTable;
