
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EstimateRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  currentVersion: number;
  onSuccess?: () => void;
}

const EstimateRevisionDialog: React.FC<EstimateRevisionDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  currentVersion,
  onSuccess
}) => {
  const [notes, setNotes] = useState('');
  const [copyAllItems, setCopyAllItems] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateRevision = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create a new revision with incremented version number
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: currentVersion + 1,
          is_current: true,
          status: 'draft',
          notes: notes || `Revision ${currentVersion + 1} created from version ${currentVersion}`,
          revision_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (revisionError) throw revisionError;

      // 2. Update the estimate status to draft if it was sent or approved
      const { error: statusError } = await supabase
        .from('estimates')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('estimateid', estimateId);

      if (statusError) throw statusError;

      // Note: We don't need to copy items explicitly as the DB trigger copy_estimate_items_to_revision
      // will handle this automatically when is_current is set to true for the new revision

      toast({
        title: "Revision created successfully",
        description: `Created version ${currentVersion + 1} of this estimate.`,
        className: "bg-[#0485ea] text-white",
      });

      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating estimate revision:", error);
      toast({
        title: "Error creating revision",
        description: error.message || "Failed to create a new revision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Revision</DialogTitle>
          <DialogDescription>
            Create a new version of this estimate. The current version {currentVersion} will be preserved in the revision history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="revisionNotes">Revision Notes</Label>
            <Textarea
              id="revisionNotes"
              placeholder="Add notes describing the changes in this revision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="copyItems"
              checked={copyAllItems}
              onCheckedChange={(checked) => setCopyAllItems(checked as boolean)}
            />
            <Label htmlFor="copyItems" className="cursor-pointer">
              Copy all items from previous version
            </Label>
          </div>
          
          <p className="text-sm text-muted-foreground">
            After creating this revision, you'll be able to edit all details and line items.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRevision}
            disabled={isSubmitting}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Revision'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionDialog;
