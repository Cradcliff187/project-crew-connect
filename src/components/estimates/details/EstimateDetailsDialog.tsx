
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';

type EstimateDetailsDialogProps = {
  estimate: {
    id: string;
    client: string;
    project: string;
    date: string;
    amount: number;
    status: string;
    versions: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    description?: string;
  };
  items: EstimateItem[];
  revisions: EstimateRevision[];
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="flex justify-between items-center bg-primary px-6 py-4 text-white">
          <div>
            <h2 className="text-xl font-semibold">{estimate.project}</h2>
            <p className="text-white/80 text-sm">Client: {estimate.client}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-primary/20">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="border-b px-6">
            <TabsList className="bg-transparent h-14 pt-2">
              <TabsTrigger value="details" className="data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                Details
              </TabsTrigger>
              <TabsTrigger value="items" className="data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                Items
              </TabsTrigger>
              <TabsTrigger value="revisions" className="data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                Revisions {revisions.length > 0 && `(${revisions.length})`}
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:border-b-primary data-[state=active]:border-b-2 rounded-none">
                Documents
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="details" className="m-0 p-0">
              <EstimateDetailsTab estimate={estimate} />
            </TabsContent>
            
            <TabsContent value="items" className="m-0 p-0">
              <EstimateItemsTab items={items} />
            </TabsContent>
            
            <TabsContent value="revisions" className="m-0 p-0">
              <EstimateRevisionsTab revisions={revisions} formatDate={formatDate} />
            </TabsContent>
            
            <TabsContent value="documents" className="m-0 p-0">
              <EstimateDocumentsTab estimateId={estimate.id} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
