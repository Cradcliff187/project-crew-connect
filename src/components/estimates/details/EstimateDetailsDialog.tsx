
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { StatusType } from '@/types/common';
import { useEstimateToProject } from '../hooks/useEstimateToProject';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export type EstimateDetailsDialogProps = {
  estimate: {
    id: string;
    client: string;
    project: string;
    date: string;
    amount: number;
    status: StatusType | string;
    versions: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    description?: string;
  };
  items?: EstimateItem[];
  revisions?: EstimateRevision[];
  open: boolean;
  onClose: () => void;
};

const EstimateDetailsDialog: React.FC<EstimateDetailsDialogProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  open, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);
  const { toast } = useToast();
  const { convertEstimateToProject, isConverting } = useEstimateToProject();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleCreateNewVersion = async () => {
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
      
      setIsCreatingRevision(true);
      
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
      
      // Close the dialog to refresh the data
      onClose();
      
    } catch (error: any) {
      console.error('Error creating new estimate version:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create new version",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRevision(false);
    }
  };

  const handleCopyEstimate = async () => {
    try {
      setIsDuplicating(true);
      toast({
        title: "Duplicating estimate",
        description: "Please wait while we duplicate the estimate...",
      });
      
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
        .insert(newEstimateData as any) // Using type assertion to bypass TypeScript check
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
        const newItems = originalItems.map(item => {
          const { id, created_at, updated_at, ...rest } = item;
          return {
            ...rest,
            estimate_id: newEstimate.estimateid,
            revision_id: newRevision.id,
          };
        });
        
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
      
      // Close the dialog after successful duplication
      onClose();
      
    } catch (error: any) {
      console.error('Error duplicating estimate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate estimate",
        variant: "destructive"
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleConvertToProject = async () => {
    try {
      const newProject = await convertEstimateToProject(estimate);
      if (newProject) {
        toast({
          title: "Project Created",
          description: `Project ${newProject.projectid} has been created from this estimate.`,
          variant: "default"
        });
        onClose(); // Close the dialog after successful conversion
      }
    } catch (error: any) {
      console.error('Error converting estimate to project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert estimate to project",
        variant: "destructive"
      });
    }
  };

  // Check if the estimate can be converted to a project
  const canConvert = estimate.status === 'approved' || estimate.status === 'sent';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">
              Estimate <span className="text-[#0485ea]">{estimate.id}</span>
            </DialogTitle>
            <StatusBadge status={estimate.status as StatusType} />
          </div>
          <DialogDescription>
            {estimate.client} • {formatDate(estimate.date)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-end space-x-2 mb-4">
          <Button 
            variant="outline" 
            onClick={handleCreateNewVersion}
            size="sm"
            disabled={isCreatingRevision || isConverting || isDuplicating}
          >
            {isCreatingRevision ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Creating New Version...
              </>
            ) : (
              'Create New Version'
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCopyEstimate}
            size="sm"
            disabled={isDuplicating || isConverting || isCreatingRevision}
          >
            {isDuplicating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Duplicating...
              </>
            ) : (
              'Duplicate'
            )}
          </Button>
          
          <Button
            onClick={handleConvertToProject}
            size="sm"
            disabled={!canConvert || isConverting || isDuplicating || isCreatingRevision}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Project'
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="revisions">Revisions ({estimate.versions})</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="details" className="m-0">
              <EstimateDetailsTab 
                estimate={estimate} 
              />
            </TabsContent>
            
            <TabsContent value="items" className="m-0">
              <EstimateItemsTab items={items} />
            </TabsContent>
            
            <TabsContent value="revisions" className="m-0">
              <EstimateRevisionsTab 
                revisions={revisions} 
                formatDate={formatDate} 
              />
            </TabsContent>
            
            <TabsContent value="documents" className="m-0">
              <EstimateDocumentsTab estimateId={estimate.id} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
