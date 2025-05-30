import React from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import DocumentViewerContent from './DocumentViewerContent';

interface DocumentViewerDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionChange?: (document: Document) => void;
  title?: string;
  description?: string;
  relatedDocuments?: Document[];
  onViewRelatedDocument?: (document: Document) => void;
  onShare?: () => void;
}

/**
 * Dialog wrapper for DocumentViewerContent.
 * Use this for standalone document viewing in a modal.
 *
 * @example
 * <DocumentViewerDialog
 *   document={doc}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */
const DocumentViewerDialog: React.FC<DocumentViewerDialogProps> = ({
  document,
  open,
  onOpenChange,
  onVersionChange,
  title,
  description,
  relatedDocuments,
  onViewRelatedDocument,
  onShare,
}) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogDescription className="sr-only">
          {description || `View and manage document ${document.file_name}`}
        </DialogDescription>
        <DocumentViewerContent
          document={document}
          relatedDocuments={relatedDocuments}
          onViewRelatedDocument={onViewRelatedDocument}
          onShare={onShare}
          onVersionChange={onVersionChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
