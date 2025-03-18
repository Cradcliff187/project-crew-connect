
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DocumentDetailView = ({ document, open, onClose, onDelete }: DocumentDetailViewProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document.file_name}</DialogTitle>
          <DialogDescription>
            Uploaded on {formatDate(document.created_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {document.url && (
            <div className="border rounded-md overflow-hidden h-[300px] max-h-[60vh]">
              {document.file_type?.startsWith('image/') ? (
                <img
                  src={document.url}
                  alt={document.file_name}
                  className="w-full h-full object-contain"
                />
              ) : document.file_type?.includes('pdf') ? (
                <iframe
                  src={document.url}
                  title={document.file_name}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <p>Preview not available</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm">{document.category || 'Other'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Entity Type</p>
              <p className="text-sm">{document.entity_type.replace('_', ' ').toLowerCase()}</p>
            </div>
            {document.entity_id && (
              <div>
                <p className="text-sm font-medium">Entity ID</p>
                <p className="text-sm">{document.entity_id}</p>
              </div>
            )}
            {document.is_expense && (
              <>
                <div>
                  <p className="text-sm font-medium">Expense</p>
                  <p className="text-sm">Yes</p>
                </div>
                {document.amount && (
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm">${document.amount.toFixed(2)}</p>
                  </div>
                )}
                {document.expense_date && (
                  <div>
                    <p className="text-sm font-medium">Expense Date</p>
                    <p className="text-sm">{formatDate(document.expense_date)}</p>
                  </div>
                )}
              </>
            )}
          </div>
          {document.notes && (
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm">{document.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (document.url) {
                  window.open(document.url, '_blank');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
