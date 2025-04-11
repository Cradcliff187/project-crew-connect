import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntryReceipt } from '@/types/timeTracking';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface TimeEntryReceiptsProps {
  timeEntryId: string;
  onViewReceipt?: (receipt: TimeEntryReceipt) => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ 
  timeEntryId,
  onViewReceipt 
}) => {
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First get the document IDs linked to this time entry
        const { data: linkData, error: linkError } = await supabase
          .from('time_entry_document_links')
          .select('document_id')
          .eq('time_entry_id', timeEntryId);
        
        if (linkError) throw linkError;
        
        if (!linkData || linkData.length === 0) {
          setReceipts([]);
          return;
        }
        
        // Get the documents with their URLs
        const documentIds = linkData.map(link => link.document_id);
        const { data: docData, error: docError } = await supabase
          .from('documents_with_urls')
          .select('*')
          .in('document_id', documentIds);
        
        if (docError) throw docError;
        
        // Map to the right format
        const formattedReceipts = (docData || []).map(doc => ({
          id: doc.document_id,
          time_entry_id: timeEntryId,
          file_name: doc.file_name,
          file_type: doc.file_type,
          file_size: doc.file_size,
          storage_path: doc.storage_path,
          uploaded_at: doc.created_at,
          document_id: doc.document_id,
          url: doc.url,
          expense_type: doc.expense_type,
          vendor_id: doc.vendor_id,
          amount: doc.amount
        }));
        
        setReceipts(formattedReceipts);
      } catch (error: any) {
        console.error('Error fetching receipts:', error);
        setError(error.message || 'Failed to load receipts');
      } finally {
        setLoading(false);
      }
    };
    
    if (timeEntryId) {
      fetchReceipts();
    }
  }, [timeEntryId]);

  const handleDownload = async (receipt: TimeEntryReceipt) => {
    try {
      // If URL is available, open it directly
      if (receipt.url) {
        window.open(receipt.url, '_blank');
        return;
      }
      
      // Otherwise, try to generate a URL
      const { data, error } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(receipt.storage_path, 60);
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        throw new Error('Could not generate download URL');
      }
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Download Error',
        description: error.message || 'Failed to download the receipt',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Receipt className="h-4 w-4 mr-1" />
        Loading receipts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    );
  }

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Receipts</div>
      <div className="flex flex-wrap gap-2">
        {receipts.map((receipt) => (
          <Tooltip key={receipt.id}>
            <TooltipTrigger asChild>
              <div className="group relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs flex items-center"
                  onClick={() => onViewReceipt ? onViewReceipt(receipt) : handleDownload(receipt)}
                >
                  <Receipt className="h-3 w-3 mr-1" />
                  <span className="max-w-[120px] truncate">{receipt.file_name}</span>
                </Button>
                
                {receipt.expense_type && (
                  <Badge variant="outline" className="absolute -top-2 -right-2 text-[10px] px-1 py-0 h-4">
                    {receipt.expense_type}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs space-y-1">
                <div>{receipt.file_name}</div>
                {receipt.expense_type && <div>Type: {receipt.expense_type}</div>}
                {receipt.amount && <div>Amount: ${receipt.amount.toFixed(2)}</div>}
                <div className="italic">Click to {onViewReceipt ? 'view' : 'download'}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default TimeEntryReceipts;
