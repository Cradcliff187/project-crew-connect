
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2 } from 'lucide-react';
import { EstimateDetailsProps } from '../EstimateDetails';
import EstimateDetailsTab from './EstimateDetailsTab';
import EstimateItemsTab from './EstimateItemsTab';
import EstimateRevisionsTab from './EstimateRevisionsTab';
import EstimateDocumentsTab from './EstimateDocumentsTab';
import EstimateRevisionDialog from '../detail/dialogs/EstimateRevisionDialog';
import { supabase } from '@/integrations/supabase/client';
import PDFExportButton from '../detail/PDFExportButton';
import DocumentShareDialog from '../detail/dialogs/DocumentShareDialog';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';

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
  const [clientEmail, setClientEmail] = useState<string | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Ref for PDF export
  const contentRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Find the current version from revisions
  useEffect(() => {
    const currentRevision = revisions.find(rev => rev.is_current);
    if (currentRevision) {
      setCurrentVersion(currentRevision.version);
    }
  }, [revisions]);
  
  // Fetch client email when the estimate dialog opens
  useEffect(() => {
    const fetchClientEmail = async () => {
      if (estimate?.client && open) {
        try {
          const { data, error } = await supabase
            .from('contacts')
            .select('email')
            .eq('id', estimate.client)
            .single();
            
          if (data && !error) {
            setClientEmail(data.email);
          }
        } catch (err) {
          console.error("Error fetching client email:", err);
        }
      }
    };
    
    fetchClientEmail();
  }, [estimate?.client, open]);

  const handleCreateRevision = () => {
    setRevisionDialogOpen(true);
  };

  const handleRevisionSuccess = () => {
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const handleShareDocument = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
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
    revision_date: rev.date,
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
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            {estimate.project || `Estimate for ${estimate.client}`}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {estimate.description || `View and manage estimate details`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-2 border-b">
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2 ml-4">
              <PDFExportButton 
                estimateId={estimate.id}
                clientName={estimate.client}
                projectName={estimate.project || ''}
                date={estimate.date}
                contentRef={contentRef}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateRevision}
              >
                Create Revision
              </Button>
            </div>
          </div>
        </div>
        
        <div ref={contentRef} className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="m-0 mt-2">
            <EstimateDetailsTab estimate={detailsEstimate} />
          </TabsContent>
          
          <TabsContent value="items" className="m-0 mt-2">
            <EstimateItemsTab items={mappedItems} />
          </TabsContent>
          
          <TabsContent value="revisions" className="m-0 mt-2">
            <EstimateRevisionsTab 
              revisions={mappedRevisions} 
              formatDate={formatDate} 
              estimateId={estimate.id}
            />
          </TabsContent>
          
          <TabsContent value="documents" className="m-0 mt-2">
            <EstimateDocumentsTab 
              estimateId={estimate.id} 
              onShareDocument={handleShareDocument}
            />
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
