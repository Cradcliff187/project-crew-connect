import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import EstimateActions from '../EstimateActions';

/**
 * EstimateDetailsDialog displays a dialog with tabs for viewing estimate details
 * This is used within the estimates listing page when clicking on an estimate
 */
const EstimateDetailsDialog: React.FC<EstimateDetailsProps> = ({
  estimate,
  items = [],
  revisions = [],
  open,
  onClose,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState('revisions'); // Default to revisions tab
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [clientEmail, setClientEmail] = useState<string | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>(undefined);

  const contentRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  useEffect(() => {
    // Find the selected revision based on the new flag
    const selectedRevision = revisions.find(rev => rev.is_selected_for_view);
    if (selectedRevision) {
      setCurrentVersion(selectedRevision.version);
      setSelectedRevisionId(selectedRevision.id);
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
          console.error('Error fetching client email:', err);
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

  const handleRevisionSelect = (revisionId: string) => {
    setSelectedRevisionId(revisionId);
    console.log('Selected revision:', revisionId);
  };

  const mappedItems: EstimateItem[] = items.map(item => ({
    ...item,
    total_price: item.total_price || 0,
  }));

  const mappedRevisions: EstimateRevision[] = revisions.map(rev => ({
    ...rev,
    estimate_id: estimate.id,
    revision_date: rev.revision_date || new Date().toISOString(),
  }));

  const detailsEstimate = {
    ...estimate,
    project: estimate.project || '',
    amount: estimate.total || 0,
    versions: revisions.length,
  };

  // Find the selected revision for display purposes
  const selectedRevisionForDisplay = revisions.find(rev => rev.is_selected_for_view);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-[#0485ea]">
                {estimate.project || `Estimate for ${estimate.client}`}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center">
                <span className="mr-2">
                  {estimate.description || `View and manage estimate details`}
                </span>
                {selectedRevisionForDisplay && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-blue-50 text-blue-800 border-blue-200"
                  >
                    Version {selectedRevisionForDisplay.version} (Selected)
                  </Badge>
                )}
              </DialogDescription>
            </div>

            {/* Streamlined action buttons */}
            <div className="flex items-center gap-2">
              {selectedRevisionForDisplay && (
                <PDFExportButton
                  estimateId={estimate.id}
                  revisionId={selectedRevisionForDisplay?.id || ''}
                  contentRef={contentRef}
                  className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
                />
              )}

              <Button variant="outline" size="sm" onClick={handleCreateRevision}>
                <FileUp className="h-4 w-4 mr-1" />
                New Revision
              </Button>

              <EstimateActions
                status={estimate.status}
                onShare={() => setShareDialogOpen(true)}
                currentRevision={selectedRevisionForDisplay}
                estimateId={estimate.id}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b">
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="revisions">Revisions</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </Tabs>
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
                  estimateId={estimate.id}
                  currentRevisionId={selectedRevisionId}
                  onRevisionSelect={handleRevisionSelect}
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
