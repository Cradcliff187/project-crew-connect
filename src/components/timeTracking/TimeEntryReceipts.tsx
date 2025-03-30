import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, ReceiptIcon, XIcon, EyeIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { useTimeEntryReceipts } from './hooks/useTimeEntryReceipts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TimeEntryReceiptsProps {
  timeEntryId: string;
  date: string;
  hours: number;
  onClose: () => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({
  timeEntryId,
  date,
  hours,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('view');
  const [uploading, setUploading] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  
  const { receipts, loading, error, refetchReceipts } = useTimeEntryReceipts(timeEntryId);
  
  // Reset to view tab when receipts change
  useEffect(() => {
    if (receipts.length > 0 && activeTab === 'upload') {
      setActiveTab('view');
    }
  }, [receipts, activeTab]);
  
  const handleDeleteReceipt = async (documentId: string) => {
    try {
      // First remove the link between time entry and document
      const { error: unlinkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('document_id', documentId)
        .eq('time_entry_id', timeEntryId);
        
      if (unlinkError) throw unlinkError;
      
      // Then update the document to mark it as detached
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          entity_type: 'DETACHED' as EntityType,
          entity_id: 'detached'
        })
        .eq('document_id', documentId);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Receipt removed',
        description: 'The receipt has been removed from this time entry.',
      });
      
      // Close viewer if we're viewing the deleted receipt
      if (viewingReceipt && viewingReceipt.document_id === documentId) {
        setViewingReceipt(null);
      }
      
      refetchReceipts();
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete receipt: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleViewReceipt = (receipt: any) => {
    setViewingReceipt(receipt);
  };
  
  const handleAttachDocument = async (documentId?: string) => {
    if (!documentId || !timeEntryId) return;
    
    try {
      setUploading(false);
      
      // Create the link between the time entry and the document
      const { error } = await supabase.rpc('attach_document_to_time_entry', {
        p_time_entry_id: timeEntryId,
        p_document_id: documentId
      });
      
      if (error) throw error;
      
      toast({
        title: 'Receipt attached',
        description: 'The receipt has been attached to this time entry.',
      });
      
      refetchReceipts();
    } catch (error: any) {
      console.error('Error attaching document:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach document: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptIcon className="h-5 w-5 text-muted-foreground" />
            Time Entry Receipts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="text-sm text-muted-foreground">
              Date: <span className="font-medium text-foreground">{formatDate(date)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Hours: <span className="font-medium text-foreground">{hours}</span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="view" disabled={receipts.length === 0 && !loading}>
                View Receipts {receipts.length > 0 && `(${receipts.length})`}
              </TabsTrigger>
              <TabsTrigger value="upload">
                Upload Receipt
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="pt-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : receipts.length > 0 ? (
                <div className="space-y-3">
                  {receipts.map((receipt) => (
                    <Card key={receipt.document_id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ReceiptIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{receipt.file_name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {receipt.category || 'Receipt'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(receipt.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewReceipt(receipt)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteReceipt(receipt.document_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ReceiptIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No receipts attached to this time entry</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('upload')}
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Receipt
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedDocumentUpload
                    entityType="TIME_ENTRY"
                    entityId={timeEntryId}
                    onSuccess={handleAttachDocument}
                    onCancel={() => setActiveTab('view')}
                    isReceiptUpload={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {viewingReceipt && (
          <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{viewingReceipt.file_name}</DialogTitle>
              </DialogHeader>
              
              <Separator className="my-2" />
              
              <div className="overflow-auto max-h-[70vh]">
                {viewingReceipt.file_type?.includes('image') ? (
                  <img 
                    src={viewingReceipt.url} 
                    alt={viewingReceipt.file_name}
                    className="max-w-full object-contain mx-auto"
                  />
                ) : (
                  <iframe
                    src={viewingReceipt.url}
                    className="w-full h-[70vh] border rounded"
                    title={viewingReceipt.file_name}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryReceipts;
