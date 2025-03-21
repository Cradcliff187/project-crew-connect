
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

  const handleCopyEstimate = () => {
    toast({
      title: "Duplicate created",
      description: "A new draft estimate has been created",
    });
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
  const canConvert = estimate.status === 'draft' || estimate.status === 'sent';

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
          >
            Duplicate
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
              <EstimateDocumentsTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
