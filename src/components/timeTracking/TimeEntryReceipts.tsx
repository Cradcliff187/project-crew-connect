
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Trash2, Eye, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { InternalEntityType } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface Document {
  document_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  created_at: string;
}

interface TimeEntryReceiptsProps {
  timeEntryId: string;
  onReceiptChange?: () => void;
}

const TimeEntryReceipts = ({ timeEntryId, onReceiptChange }: TimeEntryReceiptsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_entry_document_links')
        .select(`
          document_id,
          documents:document_id (
            document_id,
            file_name,
            file_type,
            storage_path,
            created_at
          )
        `)
        .eq('time_entry_id', timeEntryId);
      
      if (error) throw error;
      
      const formattedDocs = data
        .map(item => item.documents as Document)
        .filter(Boolean);
      
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [timeEntryId]);
  
  const handleDocumentUploaded = () => {
    fetchDocuments();
    setShowUpload(false);
    
    if (onReceiptChange) {
      onReceiptChange();
    }
    
    toast({
      title: 'Receipt uploaded',
      description: 'The receipt has been attached to this time entry'
    });
  };
  
  const handleViewDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('document_id, file_name, file_type, storage_path')
        .eq('document_id', documentId)
        .single();
      
      if (error) throw error;
      
      const { data: urlData } = supabase
        .storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      window.open(urlData.publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Could not open the document',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return;
    }
    
    try {
      // First remove the link
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('document_id', documentId)
        .eq('time_entry_id', timeEntryId);
      
      if (linkError) throw linkError;
      
      // Then delete the document
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
      
      if (docError) throw docError;
      
      // Update the UI
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
      
      // Update time entry has_receipts flag if no documents left
      if (documents.length <= 1) {
        await supabase
          .from('time_entries')
          .update({ has_receipts: false })
          .eq('id', timeEntryId);
      }
      
      if (onReceiptChange) {
        onReceiptChange();
      }
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the receipt',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {showUpload ? (
        <EnhancedDocumentUpload
          entityType={"TIME_ENTRY" as InternalEntityType}
          entityId={timeEntryId}
          isReceiptUpload={true}
          onSuccess={handleDocumentUploaded}
          onCancel={() => setShowUpload(false)}
        />
      ) : (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {documents.length > 0 ? 'Attached Receipts' : 'No Receipts Attached'}
          </h3>
          <Button 
            onClick={() => setShowUpload(true)}
            variant="outline"
            className="gap-2"
          >
            <FileUp className="h-4 w-4" />
            Upload Receipt
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : documents.length > 0 ? (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {documents.map(doc => (
              <div 
                key={doc.document_id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-[#0485ea]" />
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Added on {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewDocument(doc.document_id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.document_id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : !showUpload && (
        <div className="text-center py-10 border border-dashed rounded-md bg-muted/30">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No receipts attached to this time entry</p>
          <Button
            variant="link"
            onClick={() => setShowUpload(true)}
            className="mt-2"
          >
            Upload a receipt
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeEntryReceipts;
