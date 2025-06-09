import React, { useState, useEffect } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit, FileUp, Copy, ArrowRight, Download, Trash2 } from 'lucide-react';
import { EstimateType } from '../EstimatesTable';
import StatusBadge from '@/components/common/status/StatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StatusType } from '@/types/common';
import { convertEstimateToProject, isEstimateConverted } from '@/services/estimateService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimateRowProps {
  estimate: EstimateType;
  onRefreshEstimates?: () => void;
  onViewEstimate: (estimate: EstimateType) => void;
}

const EstimateRow: React.FC<EstimateRowProps> = ({
  estimate,
  onRefreshEstimates,
  onViewEstimate,
}): React.ReactElement | null => {
  const navigate = useNavigate();

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    if (estimate.id) {
      navigate(`/estimates/${estimate.id}`);
    } else {
      console.error('Attempted to navigate with undefined estimate ID:', estimate);
      toast({
        title: 'Navigation Error',
        description: 'Cannot view details: Estimate ID is missing.',
        variant: 'destructive',
      });
    }
  };

  // Create a new version of the estimate
  const handleCreateNewVersion = async () => {
    if (!estimate.id) {
      toast({ title: 'Error', description: 'Estimate ID missing.', variant: 'destructive' });
      return;
    }
    try {
      toast({
        title: 'Creating new version',
        description: 'Please wait while we create a new version of this estimate',
      });

      // Get current revision
      const { data: currentRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimate.id)
        .eq('is_selected_for_view', true)
        .single();

      if (revisionError) {
        throw new Error(`Could not find current revision: ${revisionError.message}`);
      }

      // Create new revision
      const newVersion = (currentRevision.version || 1) + 1;
      const { data: newRevision, error: newRevisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimate.id,
          version: newVersion,
          is_selected_for_view: true,
          status: currentRevision.status,
          revision_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (newRevisionError) {
        throw new Error(`Could not create new revision: ${newRevisionError.message}`);
      }

      // Update old revision to not be current
      const { error: updateError } = await supabase
        .from('estimate_revisions')
        .update({ is_selected_for_view: false })
        .eq('id', currentRevision.id);

      if (updateError) {
        throw new Error(`Could not update old revision: ${updateError.message}`);
      }

      // Copy items from old revision to new
      const { data: oldItems, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevision.id);

      if (itemsError) {
        throw new Error(`Could not get old items: ${itemsError.message}`);
      }

      // Prepare new items with new revision ID
      const newItems = oldItems.map(item => ({
        ...item,
        id: undefined, // Let DB generate new ID
        revision_id: newRevision.id,
        created_at: new Date().toISOString(),
        original_item_id: item.id, // Link back to the item in the source revision
      }));

      // Insert new items
      if (newItems.length > 0) {
        const { error: insertError } = await supabase.from('estimate_items').insert(newItems);
        if (insertError) {
          throw new Error(`Could not copy items: ${insertError.message}`);
        }
      }

      toast({
        title: 'New version created',
        description: `Version ${newVersion} has been created successfully`,
      });

      // Refresh data
      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create new version',
        variant: 'destructive',
      });
    }
  };

  // Duplicate estimate
  const handleDuplicateEstimate = async () => {
    if (!estimate.id) {
      toast({ title: 'Error', description: 'Estimate ID missing.', variant: 'destructive' });
      return;
    }
    try {
      toast({
        title: 'Duplicating estimate',
        description: 'Please wait while we duplicate this estimate',
      });

      // Get the current estimate data
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimate.id)
        .single();

      if (estimateError) {
        throw new Error(`Could not find estimate: ${estimateError.message}`);
      }

      // Generate a new ID for the duplicate
      const estimateIdPrefix = 'EST-';
      const randomId = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
      const newEstimateId = estimateIdPrefix + randomId;

      // Create new estimate with copied data
      const { data: newEstimate, error: newEstimateError } = await supabase
        .from('estimates')
        .insert({
          ...estimateData,
          estimateid: newEstimateId,
          estimateamount: estimateData.estimateamount || 0,
          projectname: `${estimateData.projectname || 'Estimate'} (Copy)`,
          datecreated: new Date().toISOString(),
          status: 'DRAFT',
        })
        .select('estimateid')
        .single();

      if (newEstimateError) {
        throw new Error(`Could not create duplicate estimate: ${newEstimateError.message}`);
      }

      // Create a new revision
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: newEstimateId,
          version: 1,
          is_selected_for_view: true,
          status: 'DRAFT',
          revision_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (revisionError) {
        throw new Error(`Could not create revision: ${revisionError.message}`);
      }

      // Get current items from the original estimate's current revision
      const { data: currentRevisionData } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimate.id)
        .eq('is_selected_for_view', true)
        .single();

      if (!currentRevisionData) {
        throw new Error('Could not find the current revision for the original estimate.');
      }

      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionData.id);

      if (itemsError) {
        throw new Error(`Could not get estimate items: ${itemsError.message}`);
      }

      // Create duplicate items with the new estimate ID and revision ID
      if (items && items.length > 0) {
        const newItems = items.map(item => ({
          ...item,
          id: undefined, // Let DB generate new ID
          estimate_id: newEstimateId,
          revision_id: newRevision.id,
          created_at: new Date().toISOString(),
          original_item_id: item.id, // Link back to the item in the source revision
        }));

        const { error: insertError } = await supabase.from('estimate_items').insert(newItems);
        if (insertError) {
          throw new Error(`Could not copy items: ${insertError.message}`);
        }
      }

      toast({
        title: 'Estimate duplicated',
        description: `A new copy has been created (ID: ${newEstimateId})`,
      });

      // Refresh the estimates list
      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
    } catch (error) {
      console.error('Error duplicating estimate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate estimate',
        variant: 'destructive',
      });
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!estimate.id) {
      toast({ title: 'Error', description: 'Estimate ID missing.', variant: 'destructive' });
      return;
    }
    try {
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your PDF',
      });

      // Simulate PDF generation with a timeout
      // In production, you would call an API endpoint that generates the PDF
      setTimeout(() => {
        // Create a fake PDF blob
        const dummyPdfContent = `
          %PDF-1.5
          1 0 obj
          << /Type /Catalog /Pages 2 0 R >>
          endobj
          2 0 obj
          << /Type /Pages /Kids [3 0 R] /Count 1 >>
          endobj
          3 0 obj
          << /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R /MediaBox [0 0 612 792] >>
          endobj
          4 0 obj
          << /Length 71 >>
          stream
          1 0 0 1 50 700 cm
          BT
          /F1 12 Tf
          (Estimate: ${estimate.id} - ${estimate.project || 'No Project'}) Tj
          ET
          endstream
          endobj
          xref
          0 5
          0000000000 65535 f
          0000000009 00000 n
          0000000058 00000 n
          0000000115 00000 n
          0000000216 00000 n
          trailer
          << /Size 5 /Root 1 0 R >>
          startxref
          337
          %%EOF
        `;

        const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Estimate-${estimate.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);

        toast({
          title: 'PDF Downloaded',
          description: 'Your estimate PDF has been downloaded',
        });
      }, 1500);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  // Delete estimate
  const handleDeleteEstimate = async () => {
    if (!estimate.id) {
      toast({ title: 'Error', description: 'Estimate ID missing.', variant: 'destructive' });
      return;
    }
    try {
      setIsDeleting(true);
      toast({ title: 'Deleting estimate' });

      // Delete items for all revisions of this estimate
      const { data: revisions, error: revError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimate.id);

      if (revError) throw new Error(`Error fetching revisions: ${revError.message}`);

      if (revisions && revisions.length > 0) {
        const revisionIds = revisions.map(r => r.id);
        const { error: itemsError } = await supabase
          .from('estimate_items')
          .delete()
          .in('revision_id', revisionIds);
        if (itemsError) throw new Error(`Error deleting items: ${itemsError.message}`);

        const { error: revDelError } = await supabase
          .from('estimate_revisions')
          .delete()
          .in('id', revisionIds);
        if (revDelError) throw new Error(`Error deleting revisions: ${revDelError.message}`);
      }

      // Delete the main estimate
      const { error: estimateError } = await supabase
        .from('estimates')
        .delete()
        .eq('estimateid', estimate.id);

      if (estimateError) {
        throw new Error(`Error deleting estimate: ${estimateError.message}`);
      }

      toast({ title: 'Estimate deleted' });
      if (onRefreshEstimates) onRefreshEstimates();
    } catch (error: any) {
      console.error('Error deleting estimate:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Define actionGroups *before* the return statement
  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-[#0485ea] hover:text-[#0375d1] font-opensans',
        },
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'New Version',
          icon: <FileUp className="h-4 w-4" />,
          onClick: handleCreateNewVersion,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'Duplicate',
          icon: <Copy className="h-4 w-4" />,
          onClick: handleDuplicateEstimate,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'Download PDF',
          icon: <Download className="h-4 w-4" />,
          onClick: handleDownloadPDF,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
      ],
    },
    {
      items: [
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => setDeleteDialogOpen(true),
          className: 'text-red-600 hover:text-red-700 font-opensans',
        },
      ],
    },
  ];

  // Check if estimate object or estimate.id is missing
  if (!estimate || !estimate.id) {
    console.error('[EstimateRow] Attempting to render row with invalid estimate data:', estimate);
    return null; // Return null if data is fundamentally invalid
  }

  return (
    <>
      <TableRow
        key={estimate.id}
        className="hover:bg-[#0485ea]/5 transition-colors cursor-pointer"
        onClick={handleViewDetails}
      >
        <TableCell className="font-medium font-opensans">
          {estimate.id ? (
            <Link
              to={`/estimates/${estimate.id}`}
              className="text-[#0485ea] hover:underline font-opensans"
              onClick={e => e.stopPropagation()}
            >
              {estimate.id.startsWith('EST-')
                ? estimate.id
                : `EST-${estimate.id.substring(0, 6)}...`}
            </Link>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell className="font-opensans">{estimate.client || 'No Client'}</TableCell>
        <TableCell className="font-opensans">{estimate.project || 'No Project'}</TableCell>
        <TableCell className="font-opensans">
          {formatDate(estimate.latestRevisionDate || estimate.date)}
        </TableCell>
        <TableCell className="font-opensans">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className="cursor-help">{formatCurrency(estimate.amount)}</span>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p className="font-opensans">Total amount from the latest revision.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell>
          <StatusBadge status={estimate.status as StatusType} />
        </TableCell>
        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
          <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-opensans">
              This action cannot be undone. This will permanently delete the estimate and all
              associated revisions and items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="font-opensans">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEstimate}
              className="bg-red-600 hover:bg-red-700 font-opensans"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EstimateRow;
