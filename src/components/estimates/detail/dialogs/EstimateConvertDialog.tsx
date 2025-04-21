import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { StatusType } from '@/types/common';
import { AlertCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { convertEstimateToProject } from '@/services/estimateService';
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
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={isOpen => {
        // Only allow closing if not in the middle of converting
        if (!isConverting) {
          onOpenChange(isOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Convert to Project</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a new project based on this estimate. The estimate will be marked as
            converted and linked to the new project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {conversionComplete && conversionResult?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex flex-col gap-2 mb-4">
            <div className="flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Successfully converted!</span>
            </div>
            <p className="ml-7 text-sm">
              The estimate has been converted to project{' '}
              <span className="font-medium">{conversionResult.projectId}</span>. You can now manage
              it in the Projects section.
            </p>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium">Select Revision to Convert</h4>
          {loadingRevisions ? (
            <div className="flex items-center justify-center p-4 border rounded-md bg-slate-50">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Loading revisions...</span>
            </div>
          ) : (
            <Select
              value={selectedRevision || undefined}
              onValueChange={setSelectedRevision}
              disabled={true}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Using current revision" />
              </SelectTrigger>
              <SelectContent>
                {revisions.map(revision => (
                  <SelectItem key={revision.id} value={revision.id}>
                    Version {revision.version}
                    {revision.is_selected_for_view ? ' (Selected View)' : ''} -{' '}
                    {formatDate(revision.revision_date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <AlertDialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <AlertDialogCancel disabled={isConverting || conversionComplete}>
              Cancel
            </AlertDialogCancel>
            <Button
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={handleConvertToProject}
              disabled={isConverting || conversionComplete}
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : conversionComplete ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Converted
                </>
              ) : (
                'Convert to Project'
              )}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EstimateConvertDialog;
