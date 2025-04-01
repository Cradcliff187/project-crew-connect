
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { EstimateDetailsProps } from '../EstimateDetails';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import EstimateRevisionDialog from '../detail/dialogs/EstimateRevisionDialog';

const EstimateDetailsDialog: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  open, 
  onClose,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Find the current version from revisions
  React.useEffect(() => {
    const currentRevision = revisions.find(rev => rev.is_current);
    if (currentRevision) {
      setCurrentVersion(currentRevision.version);
    }
  }, [revisions]);

  const handleCreateRevision = () => {
    setRevisionDialogOpen(true);
  };

  const handleRevisionSuccess = () => {
    if (onStatusChange) {
      onStatusChange();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold text-[#0485ea]">
                {estimate.project || `Estimate for ${estimate.client}`}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {estimate.description || `View and manage estimate details`}
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="mt-[-8px] mr-[-8px]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-2 border-b flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="revisions">Revisions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={handleCreateRevision}
          >
            Create Revision
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="m-0">
            <EstimateDetailsTab estimate={estimate} formatDate={formatDate} />
          </TabsContent>
          
          <TabsContent value="items" className="m-0">
            <EstimateItemsTab items={items} />
          </TabsContent>
          
          <TabsContent value="revisions" className="m-0">
            <EstimateRevisionsTab 
              revisions={revisions} 
              formatDate={formatDate} 
              estimateId={estimate.id}
            />
          </TabsContent>
          
          <TabsContent value="documents" className="m-0">
            <EstimateDocumentsTab estimateId={estimate.id} formatDate={formatDate} />
          </TabsContent>
        </div>
      </DialogContent>
      
      <EstimateRevisionDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        estimateId={estimate.id}
        currentVersion={currentVersion}
        onSuccess={handleRevisionSuccess}
      />
    </Dialog>
  );
};

export default EstimateDetailsDialog;
