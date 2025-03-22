
import { Button } from '@/components/ui/button';
import { Eye, Receipt } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';

interface ReceiptButtonProps {
  timeEntry: TimeEntry;
  onClick: (timeEntry: TimeEntry) => void;
}

const ReceiptButton = ({ timeEntry, onClick }: ReceiptButtonProps) => {
  const hasReceipt = !!timeEntry.has_receipts;
  
  return (
    <Button
      variant={hasReceipt ? "outline" : "default"}
      size="sm"
      onClick={() => onClick(timeEntry)}
      className={`flex items-center gap-1 ${
        hasReceipt 
          ? 'text-[#0485ea] hover:bg-blue-50 border-[#0485ea]/30' 
          : 'bg-[#0485ea] text-white hover:bg-[#0375d1]'
      }`}
    >
      {hasReceipt ? <Eye className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
      {hasReceipt ? 'View Receipt' : 'Add Receipt'}
    </Button>
  );
};

export default ReceiptButton;
