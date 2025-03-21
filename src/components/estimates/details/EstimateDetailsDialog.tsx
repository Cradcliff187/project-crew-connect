
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import { formatDate } from '@/lib/utils';
import { Document } from '@/components/documents/schemas/documentSchema';

interface EstimateDetailsDialogProps {
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
  documents?: Document[];
  open: boolean;
  onClose: () => void;
}

const EstimateDetailsDialog: React.FC<EstimateDetailsDialogProps> = ({
  estimate,
  items,
  revisions,
  documents = [],
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('details');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Estimate Details</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="revisions">Revisions ({revisions.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <EstimateDetailsTab estimate={estimate} />
          </TabsContent>

          <TabsContent value="items">
            <EstimateItemsTab items={items} />
          </TabsContent>

          <TabsContent value="revisions">
            <EstimateRevisionsTab 
              revisions={revisions} 
              formatDate={formatDate} 
            />
          </TabsContent>

          <TabsContent value="documents">
            <EstimateDocumentsTab 
              estimateId={estimate.id} 
              documents={documents}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsDialog;
