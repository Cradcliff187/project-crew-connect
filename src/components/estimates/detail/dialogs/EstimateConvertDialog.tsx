import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { convertEstimateToProject, updateEstimateStatus } from '@/services/estimateService';
import { StatusType } from '@/types/common';
import { AlertCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface EstimateRevision {
  id: string;
  version: number;
  revision_date: string;
  is_selected_for_view: boolean;
}

interface EstimateConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: {
    id: string;
    client: string;
    project: string;
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    amount: number;
    status: string | StatusType;
  };
  onStatusChange?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

const EstimateConvertDialog: React.FC<EstimateConvertDialogProps> = ({
  open,
  onOpenChange,
  estimate,
  onStatusChange,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(estimate.project);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    success: boolean;
    projectId?: string;
    message?: string;
  } | null>(null);

  const [revisions, setRevisions] = useState<EstimateRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsConverting(false);
      setError(null);
      setConversionComplete(false);
      setConversionResult(null);
      fetchRevisions();
    }
  }, [open, estimate.id]);

  // Fetch revisions for this estimate
  const fetchRevisions = async () => {
    setLoadingRevisions(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('id, version, revision_date, is_selected_for_view')
        .eq('estimate_id', estimate.id)
        .order('version', { ascending: false });

      if (error) {
        throw new Error(`Failed to load revisions: ${error.message}`);
      }

      setRevisions(data || []);

      // Set default to current revision
      const selectedRevisionForView = data?.find(r => r.is_selected_for_view);
      if (selectedRevisionForView) {
        setSelectedRevision(selectedRevisionForView.id);
      } else if (data && data.length > 0) {
        // Default to latest revision if no current
        setSelectedRevision(data[0].id);
      }
    } catch (err: any) {
      console.error('Error loading revisions:', err);
      setError(err.message);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleConvertToProject = async () => {
    console.log('EstimateConvertDialog: Starting conversion process...');
    setIsConverting(true);
    setError(null);
    setConversionComplete(false);
    setConversionResult(null);

    try {
      if (!selectedRevision) {
        throw new Error('Please select a revision to convert');
      }

      console.log(
        `EstimateConvertDialog: Converting estimate ${estimate.id} revision ${selectedRevision}...`
      );

      // Ensure selectedRevision is a valid UUID or null, not an empty string
      const revisionIdToPass =
        selectedRevision && selectedRevision.trim() !== '' ? selectedRevision : undefined;
      console.log(`EstimateConvertDialog: Passing revision ID to service: ${revisionIdToPass}`);

      // Call the service function with the validated revision ID
      const result = await convertEstimateToProject(estimate.id, revisionIdToPass);
      console.log('EstimateConvertDialog: Conversion result:', result);

      setConversionResult(result);

      if (result.success) {
        setConversionComplete(true);

        // Show success toast
        toast({
          title: 'Success!',
          description: `Estimate successfully converted to project ${result.projectId}`,
          variant: 'success',
          duration: 5000,
        });

        // Wait a moment to show the success message before closing
        setTimeout(() => {
          console.log('EstimateConvertDialog: Closing dialog after successful conversion');
          // Update parent components
          if (onStatusChange) onStatusChange(estimate.id, 'converted');
          if (onRefresh) onRefresh();
          onOpenChange(false);
        }, 2000);
      } else {
        setError(result.message || 'Unknown error during conversion');
        console.error('EstimateConvertDialog: Conversion failed:', result.message);
      }
    } catch (error: any) {
      console.error('EstimateConvertDialog: Error during conversion:', error);
      setError(error.message || 'Unknown error during conversion');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Estimate to Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to convert this estimate to a project? This action is
            irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleConvertToProject} disabled={isConverting}>
            {isConverting ? 'Converting...' : 'Convert to Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateConvertDialog;
