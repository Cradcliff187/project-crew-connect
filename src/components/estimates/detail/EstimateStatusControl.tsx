import React, { useState, useEffect } from 'react';
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
import { CheckIcon, ChevronDownIcon, XIcon, SendIcon, FileIcon, InfoIcon } from 'lucide-react';
import EstimateRejectDialog from './dialogs/EstimateRejectDialog';

interface EstimateStatusControlProps {
  estimateId: string;
  currentStatus: string;
  onStatusChange: () => void;
  className?: string;
}

// Define a type for the estimate update data
interface EstimateUpdateData {
  status: string;
  updated_at: string;
  approveddate?: string;
  sentdate?: string;
  [key: string]: any; // Allow other properties if needed
}

const EstimateStatusControl: React.FC<EstimateStatusControlProps> = ({
  estimateId,
  currentStatus,
  onStatusChange,
  className = '',
}) => {
  const [updating, setUpdating] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const { toast } = useToast();

  // Check if estimate is already converted/linked to a project
  useEffect(() => {
    const checkEstimateStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('projectid')
          .eq('estimateid', estimateId)
          .single();

        if (!error && data && data.projectid) {
          setIsConverted(true);
        }
      } catch (err) {
        console.error('Error checking estimate status:', err);
      }
    };

    checkEstimateStatus();
  }, [estimateId, currentStatus]);

  // Helper function to get valid transitions
  const getValidTransition = (fromStatus: string, toStatus: string): string[] => {
    // Define valid status transition paths
    const transitionMap: Record<string, string[]> = {
      draft: ['pending'],
      pending: ['sent', 'approved', 'rejected'],
      sent: ['approved', 'rejected'],
      approved: ['converted'],
      rejected: ['pending'],
      converted: [],
    };

    // Direct transition is valid
    if (transitionMap[fromStatus]?.includes(toStatus)) {
      return [toStatus];
    }

    // Find indirect path (max 1 intermediate step)
    for (const intermediate of transitionMap[fromStatus] || []) {
      if (transitionMap[intermediate]?.includes(toStatus)) {
        return [intermediate, toStatus];
      }
    }

    // No valid path found
    console.warn(`No valid transition path from ${fromStatus} to ${toStatus}`);
    return [];
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'rejected') {
      setRejectDialogOpen(true);
      return;
    }

    // Don't allow status changes for converted estimates
    if (isConverted && currentStatus === 'converted') {
      toast({
        title: 'Cannot Change Status',
        description:
          'This estimate has been converted to a project and its status cannot be changed.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      // Get the valid transition path
      const transitionPath = getValidTransition(currentStatus, newStatus);

      if (transitionPath.length === 0) {
        throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
      }

      // Apply each transition in the path
      let currentStatusValue = currentStatus;

      for (const status of transitionPath) {
        console.log(`Transitioning from ${currentStatusValue} to ${status}`);

        // Set only dates that exist in database schema
        const updateData: EstimateUpdateData = {
          status: status,
          updated_at: new Date().toISOString(),
        };

        // Only add date fields we know exist
        if (status === 'approved') {
          updateData.approveddate = new Date().toISOString();
        }

        if (status === 'sent') {
          updateData.sentdate = new Date().toISOString();
        }

        const { error } = await supabase
          .from('estimates')
          .update(updateData)
          .eq('estimateid', estimateId);

        if (error) throw error;

        // Update the current status for the next iteration
        currentStatusValue = status;

        // If we have more transitions, give DB time to process
        if (transitionPath.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Also update the revision
      await updateRevision(transitionPath[transitionPath.length - 1]);

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

  const updateRevision = async (status: string) => {
    try {
      const { error } = await supabase
        .from('estimate_revisions')
        .update({
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('estimate_id', estimateId)
        .eq('is_current', true);

      if (error) throw error;
    } catch (err) {
      console.warn('Error updating revision status:', err);
      // Don't fail the overall operation if revision update fails
    }
  };

  const getAvailableStatusOptions = () => {
    // If converted, no status changes allowed
    if (isConverted || currentStatus === 'converted') {
      return [];
    }

    switch (currentStatus) {
      case 'draft':
        return [
          {
            value: 'pending',
            label: 'Set as Pending',
            icon: <FileIcon className="h-4 w-4 mr-2" />,
          },
        ];
      case 'pending':
        return [
          { value: 'sent', label: 'Send to Client', icon: <SendIcon className="h-4 w-4 mr-2" /> },
          { value: 'approved', label: 'Approve', icon: <CheckIcon className="h-4 w-4 mr-2" /> },
          { value: 'rejected', label: 'Reject', icon: <XIcon className="h-4 w-4 mr-2" /> },
        ];
      case 'sent':
        return [
          { value: 'approved', label: 'Approve', icon: <CheckIcon className="h-4 w-4 mr-2" /> },
          { value: 'rejected', label: 'Reject', icon: <XIcon className="h-4 w-4 mr-2" /> },
        ];
      case 'approved':
        return [];
      case 'rejected':
        return [{ value: 'pending', label: 'Reopen', icon: <FileIcon className="h-4 w-4 mr-2" /> }];
      default:
        return [];
    }
  };

  const options = getAvailableStatusOptions();

  // Ensure the currentStatus is cast to StatusType safely
  const safeStatus = currentStatus as StatusType;

  // Show a different indicator if converted
  const statusIndicator =
    isConverted || currentStatus === 'converted' ? (
      <div className="flex items-center">
        <StatusBadge status={safeStatus} />
        <span className="ml-2 text-xs text-muted-foreground flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          Converted to Project
        </span>
      </div>
    ) : (
      <StatusBadge status={safeStatus} />
    );

  return (
    <div className={`flex items-center ${className}`}>
      {statusIndicator}

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
