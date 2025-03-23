
import React, { useState, useEffect } from 'react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2, ExternalLink, FileText, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DocumentDetailView = ({ document, open, onClose, onDelete }: DocumentDetailViewProps) => {
  const [viewError, setViewError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Reset state when document changes or dialog opens/closes
  useEffect(() => {
    setViewError(false);
    setLoadAttempted(false);
  }, [document, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && document) {
      setLoadAttempted(true);
      console.log('Document detail view - document loaded:', {
        id: document.document_id,
        fileName: document.file_name,
        fileType: document.file_type,
        url: document.url
      });
    }
  }, [open, loadAttempted, document]);

  if (!document) return null;

  const handleViewError = () => {
    console.log('Error loading document preview:', document.file_name);
    console.log('Document type:', document.file_type);
    setViewError(true);
  };

  // Determine the type of content for appropriate display
  const getContentType = () => {
    if (!document.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'other';
  };

  const contentType = getContentType();

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
              {viewError ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                  <p className="text-destructive font-medium mb-1">Preview not available</p>
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    This document could not be loaded in the preview.
                  </p>
                  <Button 
                    variant="outline" 
                    className="text-blue-600"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </Button>
                </div>
              ) : contentType === 'image' ? (
                <img
                  src={document.url}
                  alt={document.file_name}
                  className="w-full h-full object-contain"
                  onError={handleViewError}
                />
              ) : contentType === 'pdf' ? (
                <iframe
                  src={document.url}
                  title={document.file_name}
                  className="w-full h-full"
                  onError={handleViewError}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-1">{document.file_type || 'Unknown file type'}</p>
                    <p className="text-muted-foreground mb-3">Preview not available</p>
                    <Button 
                      variant="outline" 
                      className="text-blue-600"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open document
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
            {document.file_type && (
              <div>
                <p className="text-sm font-medium">File Type</p>
                <p className="text-sm">{document.file_type}</p>
              </div>
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
