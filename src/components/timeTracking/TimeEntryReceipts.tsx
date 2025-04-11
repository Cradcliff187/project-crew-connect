
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntryReceipt } from '@/types/timeTracking';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchTimeEntryReceipts, deleteReceipt } from './utils/receiptUtils';

interface TimeEntryReceiptsProps {
  timeEntryId?: string;
  onReceiptsChange?: () => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ 
  timeEntryId,
  onReceiptsChange 
}) => {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<TimeEntryReceipt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (timeEntryId) {
      loadReceipts();
    } else {
      setReceipts([]);
      setLoading(false);
    }
  }, [timeEntryId]);
  
  const loadReceipts = async () => {
    if (!timeEntryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedReceipts = await fetchTimeEntryReceipts(timeEntryId);
      setReceipts(loadedReceipts);
    } catch (err: any) {
      console.error('Error loading receipts:', err);
      setError(err.message || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenReceipt = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Unable to open receipt. URL is not available.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteReceipt = async (documentId: string) => {
    if (!timeEntryId) return;
    
    const success = await deleteReceipt(timeEntryId, documentId);
    
    if (success) {
      // Refresh the receipts list
      loadReceipts();
      
      // Notify parent component if provided
      if (onReceiptsChange) {
        onReceiptsChange();
      }
    }
    
    setReceiptToDelete(null);
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
          key={receipt.document_id || receipt.id} 
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
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenReceipt(receipt.url)}
              disabled={!receipt.url}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setReceiptToDelete(receipt.document_id || receipt.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Confirmation dialog for deleting receipts */}
      <AlertDialog open={!!receiptToDelete} onOpenChange={() => setReceiptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => receiptToDelete && handleDeleteReceipt(receiptToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimeEntryReceipts;
