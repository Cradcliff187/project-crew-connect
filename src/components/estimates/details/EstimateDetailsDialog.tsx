
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

  const handleCopyEstimate = async () => {
    try {
      setIsDuplicating(true);
      
      // Get the original estimate details
      const { data: originalEstimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimate.id)
        .single();
        
      if (estimateError) {
        throw estimateError;
      }
      
      // Create a new estimate based on the original
      const { data: newEstimate, error: createError } = await supabase
        .from('estimates')
        .insert({
          projectname: `${originalEstimate.projectname} (Copy)`,
          job_description: originalEstimate.job_description,
          customerid: originalEstimate.customerid,
          customername: originalEstimate.customername,
          sitelocationaddress: originalEstimate.sitelocationaddress,
          sitelocationcity: originalEstimate.sitelocationcity,
          sitelocationstate: originalEstimate.sitelocationstate,
          sitelocationzip: originalEstimate.sitelocationzip,
          datecreated: new Date().toISOString(),
          status: 'draft',
          contingency_percentage: originalEstimate.contingency_percentage || 0
        })
        .select('estimateid')
        .single();
        
      if (createError) {
        throw createError;
      }
      
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
        
      if (revisionError) {
        throw revisionError;
      }
      
      // Get original estimate items to duplicate
      const { data: originalItems, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimate.id);
        
      if (itemsError) {
        throw itemsError;
      }
      
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
          gross_margin: item.gross_margin,
          gross_margin_percentage: item.gross_margin_percentage
        }));
        
        const { error: copyItemsError } = await supabase
          .from('estimate_items')
          .insert(newItems);
          
        if (copyItemsError) {
          throw copyItemsError;
        }
      }
      
      // Copy document associations if any
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('document_id, file_name, storage_path, category, tags')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimate.id);
        
      if (docsError) {
        throw docsError;
      }
      
      // Associate documents with the new estimate
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          // Create a new document reference pointing to the same storage path
          const { error: docCreateError } = await supabase
            .from('documents')
            .insert({
              entity_id: newEstimate.estimateid,
              entity_type: 'ESTIMATE',
              file_name: doc.file_name,
              storage_path: doc.storage_path,
              category: doc.category,
              tags: doc.tags
            });
            
          if (docCreateError) {
            console.error('Error copying document:', docCreateError);
            // Continue with other documents even if one fails
          }
        }
      }
      
      toast({
        title: "Duplicate created",
        description: "A new draft estimate has been created based on this estimate.",
        variant: "default"
      });
      
      // Close the dialog and let the parent component refresh
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
    const newProject = await convertEstimateToProject(estimate);
    if (newProject) {
      toast({
        title: "Project Created",
        description: `Project ${newProject.projectid} has been created from this estimate.`,
        variant: "default"
      });
      onClose(); // Close the dialog after successful conversion
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
            onClick={handleCopyEstimate}
            size="sm"
            disabled={isDuplicating}
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
            disabled={!canConvert || isConverting}
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
