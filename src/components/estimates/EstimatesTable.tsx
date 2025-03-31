
import { FileText, Plus, Eye, Edit, Copy, ArrowRight, Download, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type EstimateType = {
  id: string;
  client: string;
  project: string;
  date: string;
  amount: number;
  status: StatusType | string;
  versions: number;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

interface EstimatesTableProps {
  estimates: EstimateType[];
  loading: boolean;
  searchQuery: string;
  onViewEstimate: (estimate: EstimateType) => void;
  formatDate: (dateString: string) => string;
  onRefreshEstimates?: () => void;
}

const EstimatesTable = ({ 
  estimates, 
  loading, 
  searchQuery, 
  onViewEstimate,
  formatDate,
  onRefreshEstimates
}: EstimatesTableProps) => {
  const filteredEstimates = estimates.filter(estimate => 
    estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Function to handle creating a new revision
  const handleCreateNewVersion = async (estimate: EstimateType) => {
    try {
      // Check if the estimate is in a state where creating a new version is allowed
      if (estimate.status !== 'draft' && estimate.status !== 'sent' && estimate.status !== 'pending') {
        toast({
          title: "Cannot create new version",
          description: "New versions can only be created for estimates in draft, sent, or pending state.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Creating new version for estimate: ${estimate.id}`);
      
      // Get the current version number
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
      const prevRevisionId = revisions && revisions.length > 0 ? revisions[0].id : null;
      const newVersion = currentVersion + 1;
      
      console.log(`Current version: ${currentVersion}, Creating version: ${newVersion}`);
      
      // Create a new revision
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimate.id,
          version: newVersion,
          is_current: true,
          status: 'draft',
          revision_date: new Date().toISOString(),
          notes: `Version ${newVersion} created as a revision of version ${currentVersion}`
        })
        .select('id')
        .single();
        
      if (revisionError || !newRevision) {
        throw revisionError || new Error('Failed to create new revision');
      }
      
      console.log(`Created new revision with ID: ${newRevision.id}`);
      
      // Copy items from previous revision to new revision
      if (prevRevisionId) {
        const { data: prevItems, error: prevItemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimate.id)
          .eq('revision_id', prevRevisionId);
        
        if (prevItemsError) {
          throw prevItemsError;
        }
        
        console.log(`Found ${prevItems?.length || 0} items to copy from previous revision`);
        
        if (prevItems && prevItems.length > 0) {
          // Prepare items for the new revision
          const newItems = prevItems.map(item => {
            const { id, created_at, updated_at, ...rest } = item;
            return {
              ...rest,
              revision_id: newRevision.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });
          
          const { error: insertError } = await supabase
            .from('estimate_items')
            .insert(newItems);
          
          if (insertError) {
            throw insertError;
          }
          
          console.log(`Copied ${newItems.length} items to the new revision`);
        }
      }
      
      // Update the estimate status to draft if it was sent or pending
      if (estimate.status === 'sent' || estimate.status === 'pending') {
        const { error: updateError } = await supabase
          .from('estimates')
          .update({ 
            status: 'draft', 
            updated_at: new Date().toISOString() 
          })
          .eq('estimateid', estimate.id);
          
        if (updateError) {
          throw updateError;
        }
        
        console.log(`Updated estimate ${estimate.id} status to draft`);
      }
      
      toast({
        title: "New version created",
        description: `Created version ${newVersion} of the estimate.`,
        variant: "default"
      });
      
      // Refresh the estimates list
      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
      
    } catch (error: any) {
      console.error('Error creating new estimate version:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create new version",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle duplicating an estimate
  const handleDuplicateEstimate = async (estimate: EstimateType) => {
    try {
      toast({
        title: "Duplicating estimate",
        description: "Please wait while we duplicate the estimate...",
      });
      
      console.log(`Duplicating estimate: ${estimate.id}`);
      
      // Get the original estimate details
      const { data: originalEstimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimate.id)
        .maybeSingle();
        
      if (estimateError || !originalEstimate) {
        throw estimateError || new Error(`No estimate found with ID ${estimate.id}`);
      }
      
      console.log('Found estimate to duplicate:', originalEstimate.estimateid);
      
      // Create a new estimate based on the original
      const newEstimateData = {
        projectname: `${originalEstimate.projectname} (Copy)`,
        "job description": originalEstimate["job description"],
        customerid: originalEstimate.customerid,
        customername: originalEstimate.customername,
        sitelocationaddress: originalEstimate.sitelocationaddress,
        sitelocationcity: originalEstimate.sitelocationcity,
        sitelocationstate: originalEstimate.sitelocationstate,
        sitelocationzip: originalEstimate.sitelocationzip,
        datecreated: new Date().toISOString(),
        status: 'draft',
        contingency_percentage: originalEstimate.contingency_percentage || 0
      };
      
      const { data: newEstimate, error: createError } = await supabase
        .from('estimates')
        .insert(newEstimateData as any)
        .select('estimateid')
        .single();
        
      if (createError || !newEstimate) {
        throw createError || new Error('Failed to create new estimate');
      }
      
      console.log('Created new estimate with ID:', newEstimate.estimateid);
      
      // Create a new revision for the new estimate
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: newEstimate.estimateid,
          version: 1,
          is_current: true,
          status: 'draft',
          revision_date: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (revisionError || !newRevision) {
        throw revisionError || new Error('Failed to create estimate revision');
      }
      
      console.log('Created new revision with ID:', newRevision.id);
      
      // Get current revision for the original estimate
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
      console.log('Current revision ID for original estimate:', currentRevisionId);
      
      // Get original estimate items to duplicate
      let query = supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimate.id);
      
      if (currentRevisionId) {
        query = query.eq('revision_id', currentRevisionId);
      }
      
      const { data: originalItems, error: itemsError } = await query;
        
      if (itemsError) {
        throw itemsError;
      }
      
      console.log(`Found ${originalItems?.length || 0} items to copy`);
      
      // Copy items to the new estimate
      if (originalItems && originalItems.length > 0) {
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
          gross_margin_percentage: item.gross_margin_percentage
        }));
        
        const { error: copyItemsError } = await supabase
          .from('estimate_items')
          .insert(newItems);
          
        if (copyItemsError) {
          throw copyItemsError;
        }
        
        console.log(`Copied ${newItems.length} items to new estimate`);
      }
      
      // Copy document associations if any
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('document_id, file_name, storage_path, category, tags, notes')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimate.id);
        
      if (docsError) {
        throw docsError;
      }
      
      console.log(`Found ${documents?.length || 0} documents to associate`);
      
      // Associate documents with the new estimate
      if (documents && documents.length > 0) {
        const documentsToInsert = documents.map(doc => ({
          entity_id: newEstimate.estimateid,
          entity_type: 'ESTIMATE',
          file_name: doc.file_name,
          storage_path: doc.storage_path,
          category: doc.category,
          tags: doc.tags,
          notes: doc.notes
        }));
        
        const { error: docInsertError } = await supabase
          .from('documents')
          .insert(documentsToInsert);
          
        if (docInsertError) {
          throw docInsertError;
        }
        
        console.log(`Associated ${documentsToInsert.length} documents with new estimate`);
      }
      
      toast({
        title: "Estimate duplicated",
        description: `A new draft estimate has been created based on ${estimate.id}.`,
        variant: "default"
      });
      
      // Refresh the estimates list
      if (onRefreshEstimates) {
        onRefreshEstimates();
      }
      
    } catch (error: any) {
      console.error('Error duplicating estimate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate estimate",
        variant: "destructive"
      });
    }
  };
  
  const getEstimateActions = (estimate: EstimateType): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => onViewEstimate(estimate)
          },
          {
            label: 'Edit estimate',
            icon: <Edit className="w-4 h-4" />,
            onClick: (e) => console.log('Edit estimate', estimate.id)
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: (e) => handleDuplicateEstimate(estimate)
          },
          {
            label: 'Create new version',
            icon: <Plus className="w-4 h-4" />,
            onClick: (e) => handleCreateNewVersion(estimate)
          }
        ]
      },
      {
        items: [
          {
            label: 'Convert to project',
            icon: <ArrowRight className="w-4 h-4" />,
            onClick: (e) => console.log('Convert to project', estimate.id)
          },
          {
            label: 'Download PDF',
            icon: <Download className="w-4 h-4" />,
            onClick: (e) => console.log('Download PDF', estimate.id)
          }
        ]
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (e) => console.log('Delete estimate', estimate.id),
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Versions</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : filteredEstimates.length > 0 ? (
            filteredEstimates.map((estimate) => (
              <TableRow key={estimate.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewEstimate(estimate)}>
                <TableCell className="font-medium">{estimate.id}</TableCell>
                <TableCell>{estimate.client}</TableCell>
                <TableCell>{estimate.project}</TableCell>
                <TableCell>{formatDate(estimate.date)}</TableCell>
                <TableCell>${estimate.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={estimate.status as StatusType} />
                </TableCell>
                <TableCell>{estimate.versions}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ActionMenu groups={getEstimateActions(estimate)} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No estimates found. Create your first estimate!</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstimatesTable;
