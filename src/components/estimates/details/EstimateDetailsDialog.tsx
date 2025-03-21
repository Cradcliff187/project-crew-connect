
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimateDetailsProps } from '../EstimateDetails';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';

const EstimateDetailsDialog: React.FC<EstimateDetailsProps> = ({
  estimate,
  items,
  revisions,
  itemDocuments,
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="revisions">Revisions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <EstimateDetailsTab estimate={estimate} />
          </TabsContent>
          
          <TabsContent value="items">
            <EstimateItemsTab items={items} itemDocuments={itemDocuments} />
          </TabsContent>
          
          <TabsContent value="revisions">
            <EstimateRevisionsTab revisions={revisions} formatDate={formatDate} />
          </TabsContent>

          <TabsContent value="documents">
            <EstimateDocumentsTab estimateId={estimate.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
