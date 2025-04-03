
import React, { useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstimateDetailsProps } from '../EstimateDetails';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import EstimateRevisionDialog from '../detail/dialogs/EstimateRevisionDialog';
import DocumentShareDialog from '../detail/dialogs/DocumentShareDialog';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import { formatEstimateDate } from './utils/formatUtils';
import EstimateDialogHeader from './components/EstimateDialogHeader';
import { useEstimateDialogState } from './hooks/useEstimateDialogState';

const EstimateDetailsDialog: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  open, 
  onClose,
  onStatusChange
}) => {
  // Ref for PDF export
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hook for state management
  const { 
    activeTab,
    setActiveTab,
    revisionDialogOpen,
    setRevisionDialogOpen,
    currentVersion,
    updateCurrentVersion,
    clientEmail,
    shareDialogOpen,
    setShareDialogOpen,
    selectedDocument,
    handleCreateRevision,
    handleShareDocument
  } = useEstimateDialogState(estimate.id, estimate.client);

  // Update current version when revisions change
  useEffect(() => {
    updateCurrentVersion(revisions);
  }, [revisions, updateCurrentVersion]);

  const handleRevisionSuccess = () => {
    if (onStatusChange) {
      onStatusChange();
    }
  };

  // Map the items to the expected format for EstimateItemsTab
  const mappedItems: EstimateItem[] = items.map(item => ({
    ...item,
    total_price: item.total,
    // Include any other required properties from EstimateItem type
  }));

  // Map the revisions to the expected format for EstimateRevisionsTab
  const mappedRevisions: EstimateRevision[] = revisions.map(rev => ({
    ...rev,
    estimate_id: estimate.id,
    revision_date: rev.date, // Map date to revision_date
    // Include any other required properties from EstimateRevision type
  }));

  // Prepare estimate for EstimateDetailsTab
  const detailsEstimate = {
    ...estimate,
    project: estimate.project || '',
    amount: estimate.total || 0,
    versions: revisions.length,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <EstimateDialogHeader 
          estimate={estimate}
          contentRef={contentRef}
          onCreateRevision={handleCreateRevision}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div ref={contentRef} className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="details" className="m-0 mt-2">
                <EstimateDetailsTab estimate={detailsEstimate} />
              </TabsContent>
              
              <TabsContent value="items" className="m-0 mt-2">
                <EstimateItemsTab items={mappedItems} />
              </TabsContent>
              
              <TabsContent value="revisions" className="m-0 mt-2">
                <EstimateRevisionsTab 
                  revisions={mappedRevisions} 
                  formatDate={formatEstimateDate} 
                  estimateId={estimate.id}
                />
              </TabsContent>
              
              <TabsContent value="documents" className="m-0 mt-2">
                <EstimateDocumentsTab 
                  estimateId={estimate.id} 
                  onShareDocument={handleShareDocument}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
      
      <EstimateRevisionDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        estimateId={estimate.id}
        currentVersion={currentVersion}
        onSuccess={handleRevisionSuccess}
      />

      <DocumentShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        document={selectedDocument}
        estimateId={estimate.id}
        clientEmail={clientEmail}
      />
    </Dialog>
  );
};

export default EstimateDetailsDialog;
