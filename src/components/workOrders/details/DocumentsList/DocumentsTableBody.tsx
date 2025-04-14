import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { FileText, Eye, Download, Trash2 } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { WorkOrderDocument } from './types';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentsTableBodyProps {
  documents: WorkOrderDocument[];
  onViewDocument: (document: WorkOrderDocument) => void;
}

const DocumentsTableBody = ({ documents, onViewDocument }: DocumentsTableBodyProps) => {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <TableBody>
      {documents.map(doc => {
        const actionGroups: ActionGroup[] = [
          {
            items: [
              {
                label: 'View Document',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => onViewDocument(doc),
                className: 'text-[#0485ea] hover:text-[#0375d1]',
              },
              {
                label: 'Download',
                icon: <Download className="h-4 w-4" />,
                onClick: () => window.open(doc.url, '_blank'),
                className: 'text-[#0485ea] hover:text-[#0375d1]',
              },
            ],
          },
        ];

        return (
          <TableRow key={doc.document_id} className="hover:bg-[#0485ea]/5 transition-colors">
            <TableCell>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{doc.file_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                {doc.is_receipt ? 'Receipt' : doc.category || 'Document'}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(doc.created_at)}</TableCell>
            <TableCell>{formatFileSize(doc.file_size || 0)}</TableCell>
            <TableCell className="text-right">
              <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default DocumentsTableBody;
