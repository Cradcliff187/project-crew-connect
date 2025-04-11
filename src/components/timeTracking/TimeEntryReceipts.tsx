
import React, { useState } from 'react';
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
import ReceiptItem from './ReceiptItem';
import { useTimeEntryReceipts } from './hooks/useTimeEntryReceipts';

interface TimeEntryReceiptsProps {
  timeEntryId?: string;
  onReceiptsChange?: () => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ 
  timeEntryId,
  onReceiptsChange 
}) => {
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  const { receipts, isLoading, error, fetchReceipts, deleteReceipt } = useTimeEntryReceipts(timeEntryId);
  
  const handleDeleteReceipt = async (documentId: string) => {
    if (!timeEntryId) return;
    
    try {
      const success = await deleteReceipt(documentId);
      
      if (success) {
        // Notify parent component if provided
        if (onReceiptsChange) {
          onReceiptsChange();
        }
      }
      
      setReceiptToDelete(null);
    } catch (err) {
      console.error('Error in handleDeleteReceipt:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Refresh receipts when the timeEntryId changes
  React.useEffect(() => {
    if (timeEntryId) {
      fetchReceipts();
    }
  }, [timeEntryId, fetchReceipts]);
  
  if (isLoading) {
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
        <ReceiptItem
          key={receipt.document_id || receipt.id}
          receipt={receipt}
          onDelete={() => setReceiptToDelete(receipt.document_id || receipt.id)}
        />
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
