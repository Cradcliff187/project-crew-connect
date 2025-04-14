import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckIcon, ChevronDownIcon, XIcon, SendIcon, FileIcon } from 'lucide-react';
import EstimateRejectDialog from './dialogs/EstimateRejectDialog';

interface EstimateStatusControlProps {
  estimateId: string;
  currentStatus: string;
  onStatusChange: () => void;
  className?: string;
}

const EstimateStatusControl: React.FC<EstimateStatusControlProps> = ({
  estimateId,
  currentStatus,
  onStatusChange,
  className = '',
}) => {
  const [updating, setUpdating] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'rejected') {
      setRejectDialogOpen(true);
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'approved' ? { approveddate: new Date().toISOString() } : {}),
          ...(newStatus === 'sent' ? { sentdate: new Date().toISOString() } : {}),
        })
        .eq('estimateid', estimateId);

      if (error) throw error;

      const { error: revisionError } = await supabase
        .from('estimate_revisions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('estimate_id', estimateId)
        .eq('is_current', true);

      if (revisionError) throw revisionError;

      toast({
        title: 'Status Updated',
        description: `Estimate status changed to ${newStatus}.`,
        className: 'bg-[#0485ea]',
      });

      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error Updating Status',
        description: error.message || 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableStatusOptions = () => {
    switch (currentStatus) {
      case 'draft':
        return [
          { value: 'sent', label: 'Send to Client', icon: <SendIcon className="h-4 w-4 mr-2" /> },
        ];
      case 'sent':
      case 'pending':
        return [
          { value: 'approved', label: 'Approve', icon: <CheckIcon className="h-4 w-4 mr-2" /> },
          { value: 'rejected', label: 'Reject', icon: <XIcon className="h-4 w-4 mr-2" /> },
        ];
      case 'approved':
        return [];
      case 'rejected':
        return [];
      default:
        return [];
    }
  };

  const options = getAvailableStatusOptions();

  // Ensure the currentStatus is cast to StatusType safely
  const safeStatus = currentStatus as StatusType;

  return (
    <div className={`flex items-center ${className}`}>
      <StatusBadge status={safeStatus} />

      {options.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={updating || options.length === 0}
              className="ml-2 border-[#0485ea]/30 hover:border-[#0485ea] hover:bg-[#0485ea]/10"
            >
              {updating ? 'Updating...' : 'Change Status'}
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {options.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className="cursor-pointer flex items-center"
              >
                {option.icon}
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <EstimateRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        estimateId={estimateId}
        onSuccess={onStatusChange}
      />
    </div>
  );
};

export default EstimateStatusControl;
