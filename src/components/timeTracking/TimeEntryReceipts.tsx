
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntryReceipt } from '@/types/timeTracking';
import { formatCurrency } from '@/lib/utils';

interface TimeEntryReceiptsProps {
  timeEntryId?: string;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ timeEntryId }) => {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (timeEntryId) {
      fetchReceipts();
    }
  }, [timeEntryId]);
  
  const fetchReceipts = async () => {
    if (!timeEntryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First get document IDs linked to this time entry
      const { data: links, error: linksError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);
        
      if (linksError) throw linksError;
      
      if (!links || links.length === 0) {
        setReceipts([]);
        setLoading(false);
        return;
      }
      
      // Extract document IDs
      const documentIds = links.map(link => link.document_id);
      
      // Get document details
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);
        
      if (documentsError) throw documentsError;
      
      // Generate signed URLs for each document
      const receiptResults = await Promise.all(
        (documents || []).map(async (doc) => {
          let url = null;
          
          try {
            const { data: signedUrl } = await supabase
              .storage
              .from('documents')
              .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour expiry
            
            url = signedUrl?.signedUrl;
          } catch (urlError) {
            console.error('Error generating signed URL:', urlError);
          }
          
          return {
            id: doc.document_id,
            time_entry_id: timeEntryId,
            file_name: doc.file_name,
            file_type: doc.file_type,
            file_size: doc.file_size,
            storage_path: doc.storage_path,
            uploaded_at: doc.created_at,
            document_id: doc.document_id,
            url: url,
            expense_type: doc.expense_type,
            vendor_id: doc.vendor_id,
            amount: doc.amount
          };
        })
      );
      
      setReceipts(receiptResults);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenReceipt = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold mb-1">Error loading receipts</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-semibold mb-1">No receipts found</h3>
        <p className="text-muted-foreground">This time entry doesn't have any receipts attached.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id} 
          className="border rounded-md p-4 flex justify-between items-center"
        >
          <div>
            <h4 className="font-medium">{receipt.file_name}</h4>
            <div className="text-sm text-muted-foreground">
              {receipt.expense_type && (
                <span className="mr-2">Type: {receipt.expense_type}</span>
              )}
              {receipt.amount !== undefined && (
                <span>Amount: {formatCurrency(receipt.amount)}</span>
              )}
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenReceipt(receipt.url)}
            disabled={!receipt.url}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TimeEntryReceipts;
