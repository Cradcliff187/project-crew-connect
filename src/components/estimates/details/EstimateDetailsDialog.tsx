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
import { FileDown } from 'lucide-react';
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
import { formatDate as formatDateUtil } from '@/lib/utils';

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
  
  const contentRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  useEffect(() => {
    const currentRevision = revisions.find(rev => rev.is_current);
    if (currentRevision) {
      setCurrentVersion(currentRevision.version);
    }
  }, [revisions]);
  
  useEffect(() => {
    const fetchClientEmail = async () => {
      if (open) {
        try {
          if (estimate.customerId) {
            console.log('Using customer ID for lookup:', estimate.customerId);
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('contactemail')
              .eq('customerid', estimate.customerId)
              .maybeSingle();
              
            if (customerData && !customerError) {
              if (customerData.contactemail) {
                setClientEmail(customerData.contactemail);
                return;
              }
            }
            
            const { data: contactData, error: contactError } = await supabase
              .from('contacts')
              .select('email')
              .eq('id', estimate.customerId)
              .maybeSingle();
              
            if (contactData && !contactError && contactData.email) {
              setClientEmail(contactData.email);
              return;
            }
          }
          
          if (!estimate.customerId && estimate.client) {
            console.log('Falling back to client name lookup:', estimate.client);
            const { data: nameContactData, error: nameContactError } = await supabase
              .from('contacts')
              .select('email')
              .eq('name', estimate.client)
              .maybeSingle();
            
            if (nameContactData && !nameContactError && nameContactData.email) {
              setClientEmail(nameContactData.email);
              return;
            }
            
            const { data: nameCustomerData, error: nameCustomerError } = await supabase
              .from('customers')
              .select('contactemail')
              .eq('customername', estimate.client)
              .maybeSingle();
            
            if (nameCustomerData && !nameCustomerError && nameCustomerData.contactemail) {
              setClientEmail(nameCustomerData.contactemail);
              return;
            }
          }
          
          console.log('No client email found for:', estimate.customerId || estimate.client);
          setClientEmail(undefined);
        } catch (err) {
          console.error("Error fetching client email:", err);
          setClientEmail(undefined);
        }
      }
    };
    
    fetchClientEmail();
  }, [estimate.customerId, estimate.client, open]);

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

  const mappedItems: EstimateItem[] = items.map(item => ({
    ...item,
    total_price: item.total_price || item.total || 0,
  }));

  const mappedRevisions: EstimateRevision[] = revisions.map(rev => ({
    ...rev,
    estimate_id: estimate.id,
    revision_date: rev.revision_date || rev.date || new Date().toISOString(),
  }));

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
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b flex justify-between items-center">
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="revisions">Revisions</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex gap-2 ml-4">
              <PDFExportButton 
                estimateId={estimate.id}
                revisionId={revisions.find(rev => rev.is_current)?.id || ''}
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
          
          <div ref={contentRef} className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onRefresh={onStatusChange}
                  clientName={estimate.client}
                  clientEmail={clientEmail}
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
