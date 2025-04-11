
import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { TimeEntryReceipt } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';

interface ReceiptItemProps {
  receipt: TimeEntryReceipt;
  onDelete: (receiptId: string) => void;
}

const ReceiptItem: React.FC<ReceiptItemProps> = ({ receipt, onDelete }) => {
  const documentId = receipt.document_id || receipt.id;
  
  const handleOpenReceipt = () => {
    if (receipt.url) {
      window.open(receipt.url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Unable to open receipt. URL is not available.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="border rounded-md p-4 flex justify-between items-center">
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
          onClick={handleOpenReceipt}
          disabled={!receipt.url}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(documentId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReceiptItem;
