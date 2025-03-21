
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimateDetailsProps } from '../EstimateDetails';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from '../details/EstimateDocumentsTab';

const EstimateDetailsDialog = ({ 
  estimate, 
  items, 
  revisions, 
  documents, 
  open, 
  onClose,
  onDocumentAdded
}: EstimateDetailsProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Estimate Details</DialogTitle>
        <Tabs defaultValue="details" className="w-full">
          <div className="border-b">
            <div className="px-4">
              <TabsList className="mt-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="documents">
                  Documents
                  {documents && documents.length > 0 && (
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0485ea] text-[0.7rem] text-white">
                      {documents.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[80vh]">
            <TabsContent value="details">
              <EstimateDetailsTab estimate={estimate} />
            </TabsContent>
            
            <TabsContent value="items">
              <EstimateItemsTab
                items={items}
                estimateId={estimate.id}
              />
            </TabsContent>
            
            <TabsContent value="revisions">
              <EstimateRevisionsTab
                revisions={revisions}
                estimateId={estimate.id}
              />
            </TabsContent>
            
            <TabsContent value="documents">
              <EstimateDocumentsTab 
                documents={documents} 
                estimateId={estimate.id}
                onDocumentAdded={onDocumentAdded}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
