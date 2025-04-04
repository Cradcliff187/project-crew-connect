
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Trash2, Upload, Loader2, Receipt, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTimeEntryReceipts } from './hooks/useTimeEntryReceipts';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface TimeEntryReceiptsProps {
  timeEntryId?: string;
  entityType?: 'work_order' | 'project';
  entityId?: string;
  onReceiptChange?: () => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ 
  timeEntryId,
  entityType,
  entityId,
  onReceiptChange
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  
  const { receipts, isLoading, fetchReceipts, deleteReceipt } = useTimeEntryReceipts(timeEntryId);
  
  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    fetchReceipts();
    if (onReceiptChange) onReceiptChange();
  };
  
  const handleViewReceipt = (url: string) => {
    setSelectedReceipt(url);
    setShowViewDialog(true);
  };
  
  const handleDeleteReceipt = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }
    
    const success = await deleteReceipt(documentId);
    if (success && onReceiptChange) {
      onReceiptChange();
    }
  };
  
  if (!timeEntryId) {
    return <div className="text-sm text-muted-foreground">Please save the time entry first to manage receipts.</div>;
  }
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md">Receipts</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-6 border rounded bg-muted/50">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No receipts have been attached yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {receipts.map((receipt) => (
                <div 
                  key={receipt.document_id} 
                  className="flex flex-col p-3 rounded-md border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{receipt.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(receipt.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {receipt.url && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => receipt.url && handleViewReceipt(receipt.url)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <a href={receipt.url} download={receipt.file_name} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteReceipt(receipt.document_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {receipt.tags && receipt.tags.length > 0 && (
                    <div className="mt-2 pt-2 border-t flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {receipt.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType="TIME_ENTRY"
            entityId={timeEntryId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadDialog(false)}
            isReceiptUpload={true}
            prefillData={{
              expenseName: `Time entry receipt for ${entityType} ${entityId}`
            }}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>View Receipt</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedReceipt && (
              <iframe
                src={selectedReceipt}
                className="w-full h-full rounded-md border"
                title="Receipt"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryReceipts;
