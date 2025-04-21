import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstimateRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  onSuccess?: () => void;
}

const EstimateRejectDialog: React.FC<EstimateRejectDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  onSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [createRevision, setCreateRevision] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this estimate.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update the estimate status to "rejected"
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('estimateid', estimateId);

      if (updateError) throw updateError;

      // 2. Record the rejection reason in the activity log
      const { error: logError } = await supabase.from('activitylog').insert({
        action: 'Rejection',
        moduletype: 'ESTIMATES',
        referenceid: estimateId,
        status: 'rejected',
        previousstatus: 'pending',
        timestamp: new Date().toISOString(),
        detailsjson: JSON.stringify({ reason: rejectionReason }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (logError) throw logError;

      // 3. If user wants to create a revision, create a new one
      if (createRevision) {
        // Find the current revision
        const { data: selectedRevision, error: revisionError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('is_selected_for_view', true)
          .single();

        if (revisionError && revisionError.code !== 'PGRST116') {
          throw revisionError;
        }

        // Create a new revision with incremented version number
        const currentVersion = selectedRevision?.version || 1;
        const { error: newRevisionError } = await supabase.from('estimate_revisions').insert({
          estimate_id: estimateId,
          version: currentVersion + 1,
          is_selected_for_view: true,
          status: 'draft',
          notes: `Revision created after rejection. Reason: ${rejectionReason}`,
          revision_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (newRevisionError) throw newRevisionError;

        // The estimate's status should be 'draft' when a new revision is created
        const { error: statusError } = await supabase
          .from('estimates')
          .update({
            status: 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('estimateid', estimateId);

        if (statusError) throw statusError;
      }

      toast({
        title: 'Estimate rejected',
        description: createRevision
          ? 'Estimate was rejected and a new draft revision was created.'
          : 'Estimate was rejected.',
        className: 'bg-[#0485ea]',
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error rejecting estimate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject estimate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Estimate</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this estimate. This information will be stored in the
            activity log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createRevision"
              checked={createRevision}
              onCheckedChange={checked => setCreateRevision(checked as boolean)}
            />
            <Label htmlFor="createRevision" className="cursor-pointer">
              Create a new draft revision
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
            {isSubmitting ? 'Rejecting...' : 'Reject Estimate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRejectDialog;
