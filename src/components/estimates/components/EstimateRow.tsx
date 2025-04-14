import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, FileUp, Copy, ArrowRight, Download, Trash2 } from 'lucide-react';
import { EstimateType } from '../EstimatesTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { StatusType } from '@/types/common';

interface EstimateRowProps {
  estimate: EstimateType;
  onViewEstimate: (estimate: EstimateType) => void;
  onRefreshEstimates?: () => void;
}

const EstimateRow: React.FC<EstimateRowProps> = ({
  estimate,
  onViewEstimate,
  onRefreshEstimates,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    onViewEstimate(estimate);
  };

  const handleCreateNewVersion = async () => {
    try {
      if (
        estimate.status !== 'draft' &&
        estimate.status !== 'sent' &&
        estimate.status !== 'pending'
      ) {
        toast({
          title: 'Cannot create new version',
          description:
            'New versions can only be created for estimates in draft, sent, or pending state.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Creating new revision...',
        description: 'Please wait while we create a new revision for this estimate.',
      });

      const { data: revisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('version, id')
        .eq('estimate_id', estimate.id)
        .order('version', { ascending: false })
        .limit(1);

      if (revisionsError) {
        throw revisionsError;
      }

      const currentVersion = revisions && revisions.length > 0 ? revisions[0].version : 0;
      const newVersion = currentVersion + 1;

      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimate.id,
          version: newVersion,
          is_current: true,
          status: 'draft',
          revision_date: new Date().toISOString(),
          notes: `Version ${newVersion} created as a revision of version ${currentVersion}`,
        })
        .select('id')
        .single();

      if (revisionError || !newRevision) {
        throw revisionError || new Error('Failed to create new revision');
      }

      if (estimate.status === 'sent' || estimate.status === 'pending') {
        const { error: updateError } = await supabase
          .from('estimates')
          .update({
            status: 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('estimateid', estimate.id);

        if (updateError) {
          throw updateError;
        }
      }

      toast({
        title: 'New revision created',
        description: `Created version ${newVersion} of the estimate.`,
        variant: 'default',
      });

      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
    } catch (error: any) {
      console.error('Error creating new estimate version:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create new version',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateEstimate = async () => {
    try {
      toast({
        title: 'Duplicating estimate',
        description: 'Please wait while we duplicate the estimate...',
      });

      const { data: originalEstimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimate.id)
        .maybeSingle();

      if (estimateError || !originalEstimate) {
        throw estimateError || new Error(`No estimate found with ID ${estimate.id}`);
      }

      const newEstimateData = {
        projectname: `${originalEstimate.projectname} (Copy)`,
        'job description': originalEstimate['job description'],
        customerid: originalEstimate.customerid,
        customername: originalEstimate.customername,
        sitelocationaddress: originalEstimate.sitelocationaddress,
        sitelocationcity: originalEstimate.sitelocationcity,
        sitelocationstate: originalEstimate.sitelocationstate,
        sitelocationzip: originalEstimate.sitelocationzip,
        datecreated: new Date().toISOString(),
        status: 'draft',
        contingency_percentage: originalEstimate.contingency_percentage || 0,
      };

      const { data: newEstimate, error: createError } = await supabase
        .from('estimates')
        .insert(newEstimateData as any)
        .select('estimateid')
        .single();

      if (createError || !newEstimate) {
        throw createError || new Error('Failed to create new estimate');
      }

      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: newEstimate.estimateid,
          version: 1,
          is_current: true,
          status: 'draft',
          revision_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (revisionError || !newRevision) {
        throw revisionError || new Error('Failed to create estimate revision');
      }

      const { data: currentRevision, error: getCurrentError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimate.id)
        .eq('is_current', true)
        .maybeSingle();

      if (getCurrentError) {
        throw getCurrentError;
      }

      const currentRevisionId = currentRevision?.id;

      let query = supabase.from('estimate_items').select('*').eq('estimate_id', estimate.id);

      if (currentRevisionId) {
        query = query.eq('revision_id', currentRevisionId);
      }

      const { data: originalItems, error: itemsError } = await query;

      if (itemsError) {
        throw itemsError;
      }

      const newItems = originalItems.map(item => ({
        estimate_id: newEstimate.estimateid,
        revision_id: newRevision.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        cost: item.cost,
        markup_percentage: item.markup_percentage,
        markup_amount: item.markup_amount,
        vendor_id: item.vendor_id,
        subcontractor_id: item.subcontractor_id,
        item_type: item.item_type,
        document_id: item.document_id,
        gross_margin: item.gross_margin,
        gross_margin_percentage: item.gross_margin_percentage,
      }));

      const { error: copyItemsError } = await supabase.from('estimate_items').insert(newItems);

      if (copyItemsError) {
        throw copyItemsError;
      }

      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('document_id, file_name, storage_path, category, tags, notes')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimate.id);

      if (docsError) {
        throw docsError;
      }

      const documentsToInsert = documents.map(doc => ({
        entity_id: newEstimate.estimateid,
        entity_type: 'ESTIMATE',
        file_name: doc.file_name,
        storage_path: doc.storage_path,
        category: doc.category,
        tags: doc.tags,
        notes: doc.notes,
      }));

      const { error: docInsertError } = await supabase.from('documents').insert(documentsToInsert);

      if (docInsertError) {
        throw docInsertError;
      }

      toast({
        title: 'Estimate duplicated',
        description: `A new draft estimate has been created based on ${estimate.id}.`,
        variant: 'default',
      });

      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
    } catch (error: any) {
      console.error('Error duplicating estimate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate estimate',
        variant: 'destructive',
      });
    }
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-[#0485ea] hover:text-[#0375d1]',
        },
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
    {
      items: [
        {
          label: 'Create New Version',
          icon: <FileUp className="h-4 w-4" />,
          onClick: () => handleCreateNewVersion(),
          className: 'text-gray-600 hover:text-gray-800',
        },
        {
          label: 'Convert to Project',
          icon: <ArrowRight className="h-4 w-4" />,
          onClick: () => console.log('Convert to project', estimate.id),
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
    {
      items: [
        {
          label: 'Duplicate',
          icon: <Copy className="h-4 w-4" />,
          onClick: () => handleDuplicateEstimate(),
          className: 'text-gray-600 hover:text-gray-800',
        },
        {
          label: 'Download PDF',
          icon: <Download className="h-4 w-4" />,
          onClick: () => console.log('Download PDF', estimate.id),
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
    {
      items: [
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => console.log('Delete estimate', estimate.id),
          className: 'text-red-600 hover:text-red-800',
        },
      ],
    },
  ];

  return (
    <TableRow
      key={estimate.id}
      className="hover:bg-[#0485ea]/5 transition-colors cursor-pointer"
      onClick={handleViewDetails}
    >
      <TableCell className="font-medium">
        <Link to={`/estimates/${estimate.id}`} className="text-[#0485ea] hover:underline">
          {estimate.id.substring(0, 8)}
        </Link>
      </TableCell>
      <TableCell>{estimate.client}</TableCell>
      <TableCell>{estimate.project}</TableCell>
      <TableCell>{formatDate(estimate.date)}</TableCell>
      <TableCell>{formatCurrency(estimate.amount)}</TableCell>
      <TableCell>
        <StatusBadge status={estimate.status as StatusType} />
      </TableCell>
      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
        <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
      </TableCell>
    </TableRow>
  );
};

export default EstimateRow;
