import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, FileUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { StatusType } from '@/types/common';

import EstimateDetailContent from '@/components/estimates/detail/EstimateDetailContent';
import EstimateDocumentsTab from '@/components/estimates/details/EstimateDocumentsTab';
import EstimateEmailTab from '@/components/estimates/detail/EstimateEmailTab';
import EstimateRevisionsTab from '@/components/estimates/details/EstimateRevisionsTab';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';
import DocumentShareDialog from '@/components/estimates/detail/dialogs/DocumentShareDialog';
import EstimateStatusControl from '@/components/estimates/detail/EstimateStatusControl';
import EstimateActions from '@/components/estimates/EstimateActions';
import EstimateRevisionDialog from '@/components/estimates/detail/dialogs/EstimateRevisionDialog';
import PDFExportButton from '@/components/estimates/detail/PDFExportButton';
import EstimateConvertDialog from '@/components/estimates/detail/dialogs/EstimateConvertDialog';
import { isEstimateConverted } from '@/services/estimateService';

const EstimateDetailPage = () => {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRevision, setCurrentRevision] = useState<any>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [revisions, setRevisions] = useState<any[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Use the custom hook for fetching estimate details
  const {
    estimateRevisions,
    fetchEstimateDetails,
    isLoading: revisionsLoading,
    refetchRevisions,
    setRevisionAsCurrent,
  } = useEstimateDetails();

  useEffect(() => {
    if (estimateId) {
      fetchEstimateData(estimateId);
      // Also fetch revisions using the custom hook
      fetchEstimateDetails(estimateId);
    }
  }, [estimateId]);

  // Function to update revision amounts if they are missing
  const updateRevisionAmountsIfNeeded = async (revisionId: string) => {
    try {
      // Get the items for this revision
      const { data: items, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionId);

      if (itemsError) {
        console.error('Error fetching items for revision amount update:', itemsError);
        return;
      }

      if (!items || items.length === 0) {
        return;
      }

      // Calculate total amount - using Number() to ensure we're working with numbers
      const totalAmount = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);

      // Get current revision amount
      const { data: revision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('amount')
        .eq('id', revisionId)
        .single();

      if (revisionError) {
        console.error('Error fetching revision for amount update:', revisionError);
        return;
      }

      // Only update if the amount is null, 0, or different from calculated total
      if (
        !revision.amount ||
        revision.amount === 0 ||
        Math.abs(revision.amount - totalAmount) > 0.01
      ) {
        await supabase
          .from('estimate_revisions')
          .update({ amount: totalAmount })
          .eq('id', revisionId);

        console.log(`Updated revision ${revisionId} amount to ${totalAmount}`);
      }
    } catch (err) {
      console.error('Error updating revision amount:', err);
    }
  };

  const fetchEstimateData = async (id: string) => {
    setLoading(true);
    setError(null);
    let determinedRevision: any = null; // Store the revision to be displayed
    let allRevisionsData: any[] = []; // Store all revisions for the list

    try {
      // 1. Fetch base estimate data with customer join
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*, customers:customerid(customername, contactemail)')
        .eq('estimateid', id)
        .single();

      if (estimateError) throw estimateError;

      // Add customer information from the join to the estimate object
      const estimateWithCustomer = {
        ...estimateData,
        customername:
          estimateData.customers?.customername || estimateData.customername || 'No Customer',
        // We'll use customer information in the component directly from customers property
      };

      // 2. Try find already selected revision
      const { data: selectedRevisionData, error: selectedRevisionError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', id)
        .eq('is_selected_for_view', true)
        .maybeSingle(); // Use maybeSingle to handle zero or one result

      if (selectedRevisionError && selectedRevisionError.code !== 'PGRST116') {
        // Ignore PGRST116 (No rows found), but throw other errors
        throw selectedRevisionError;
      }

      if (selectedRevisionData) {
        determinedRevision = selectedRevisionData;
      } else {
        // 3. If none selected, find the latest revision by version
        const { data: latestRevisionData, error: latestRevisionError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', id)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestRevisionError && latestRevisionError.code !== 'PGRST116') {
          throw latestRevisionError;
        }

        if (latestRevisionData) {
          // 4. Latest found, ensure it's marked selected
          determinedRevision = latestRevisionData;
          // Ensure only this one is marked selected (atomic if possible, otherwise two steps)
          // Using the hook function which handles this logic
          await setRevisionAsCurrent(determinedRevision.id, id);
          // Update local object in case the hook doesnt immediately reflect state
          determinedRevision.is_selected_for_view = true;
        } else {
          // 5. No revisions exist, create the first one
          const { data: newRevision, error: newRevisionError } = await supabase
            .from('estimate_revisions')
            .insert({
              estimate_id: id,
              version: 1,
              is_selected_for_view: true,
              revision_date: new Date().toISOString(),
              amount: estimateWithCustomer.estimateamount,
              status: estimateWithCustomer.status || 'draft', // Default to draft if estimate status is null
            })
            .select()
            .single();

          if (newRevisionError) throw newRevisionError;
          determinedRevision = newRevision;
          toast({
            title: 'New Revision Created',
            description: 'Initial revision V1 created for this estimate.',
            variant: 'default',
          });
        }
      }

      // 6. We now have a determinedRevision, fetch its items
      let itemsData: any[] = [];
      let itemsError: any = null;
      if (determinedRevision && determinedRevision.id) {
        const { data, error } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', id)
          .eq('revision_id', determinedRevision.id)
          .order('created_at', { ascending: true });
        itemsData = data || [];
        itemsError = error;
      } else {
        // This case should ideally not be reached with the new logic
        console.error('Critical error: Could not determine a revision ID to fetch items for.');
      }

      if (itemsError) {
        console.error('Error fetching estimate items:', itemsError);
        // Optionally, inform the user, but don't crash
      }

      // 7. Fetch all revisions for the history list
      const { data: allRevisionsResult, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', id)
        .order('version', { ascending: false });

      if (revisionsError) {
        console.error('Error fetching estimate revisions list:', revisionsError);
      } else {
        allRevisionsData = allRevisionsResult || [];
        // Ensure the determinedRevision in the list reflects the selected state
        allRevisionsData = allRevisionsData.map(rev => ({
          ...rev,
          is_selected_for_view: rev.id === determinedRevision?.id,
        }));
      }

      // 8. Set component states
      setCurrentRevision(determinedRevision);
      setRevisions(allRevisionsData);
      setEstimate({
        ...estimateWithCustomer,
        items: itemsData,
        // Pass the determined revision data for consistency
        currentRevision: determinedRevision,
      });

      // 9. Update revision amounts if needed (can run async without blocking UI)
      updateRevisionAmountsIfNeeded(determinedRevision.id);
      allRevisionsData.forEach(rev => {
        if (rev.id !== determinedRevision.id) {
          updateRevisionAmountsIfNeeded(rev.id);
        }
      });
    } catch (error: any) {
      console.error('Error fetching estimate data:', error);
      setError(error.message || 'Error fetching estimate data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (estimateId) {
      fetchEstimateData(estimateId);
      refetchRevisions();
    }
  };

  const handleBackClick = () => {
    navigate('/estimates');
  };

  const handleStatusChange = (id?: string, newStatus?: string) => {
    if (newStatus === 'converted') {
      toast({
        title: 'Conversion Successful',
        description: 'Estimate has been successfully converted to a project.',
        variant: 'success',
      });
    } else if (newStatus) {
      toast({
        title: 'Status Updated',
        description: `Estimate status has been updated to ${newStatus}.`,
      });
    }

    handleRefresh();
  };

  const handleDelete = async () => {
    // Implementation for deleting the estimate would go here
    // After successful delete, navigate back to the list
    handleBackClick();
  };

  const handleConvert = async () => {
    console.log('EstimateDetailPage: Convert button clicked, opening dialog...');
    // Open the conversion dialog with the current revision
    setConvertDialogOpen(true);
  };

  const handleRevisionSelect = async (revisionId: string) => {
    const selectedRevision = (estimateRevisions.length > 0 ? estimateRevisions : revisions).find(
      rev => rev.id === revisionId
    );

    if (selectedRevision) {
      setCurrentRevision(selectedRevision);

      // We still call setRevisionAsCurrent to ensure flags are correctly set in DB
      // even if the selected one might already appear selected locally.
      if (estimateId) {
        // First set this as the current revision in database
        await setRevisionAsCurrent(revisionId, estimateId);
      }

      toast({
        title: `Viewing Revision ${selectedRevision.version}`,
        description: 'Now viewing this revision. Use the History tab to change selection.',
      });

      // Fetch items for this specific revision
      if (estimateId && selectedRevision.id) {
        // Fetch items for this specific revision
        supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('revision_id', selectedRevision.id)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching revision items:', error);
              return;
            }

            setEstimate(prev => ({
              ...prev,
              items: data || [],
              currentRevision: selectedRevision,
            }));
          });
      }
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error || !estimate) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBackClick} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>

          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Estimate</h1>
                <p className="mt-2 text-gray-600">{error || 'Estimate not found'}</p>
                <Button onClick={handleBackClick} className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]">
                  Return to Estimates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Use the more robust revisions data either from our direct query or from the hook
  const displayRevisions = estimateRevisions.length > 0 ? estimateRevisions : revisions;

  const canCreateRevision = ['draft', 'sent', 'pending', 'approved', 'rejected'].includes(
    estimate.status
  );

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Header Section with Back Button, Status Control and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBackClick} size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">
                  Estimate #{estimate.estimateid.substring(4, 10)}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {estimate.customername || 'No customer'} • Created{' '}
                {new Date(estimate.datecreated).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* PDF Export Button */}
            {currentRevision && (
              <PDFExportButton
                estimateId={estimate.estimateid}
                revisionId={currentRevision.id}
                revisionVersion={currentRevision.version}
                viewType="internal"
                className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
              />
            )}

            {canCreateRevision && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevisionDialogOpen(true)}
                className="flex items-center"
              >
                <FileUp className="h-4 w-4 mr-1" />
                New Revision
              </Button>
            )}

            <EstimateActions
              status={estimate.status}
              onEdit={() => {}}
              onDelete={handleDelete}
              onConvert={handleConvert}
              onShare={() => setShareDialogOpen(true)}
              currentRevision={currentRevision}
              estimateId={estimate.estimateid}
            />
          </div>
        </div>

        {/* Main Content - Remove Layout Wrapper and Sidebar */}
        {/* Render Tabs directly, taking full width */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
                <TabsTrigger value="overview">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="email">Communication</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <EstimateDetailContent data={estimate} onRefresh={handleRefresh} />
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <EstimateDocumentsTab
                    estimateId={estimate.estimateid}
                    estimateName={
                      estimate.projectname || `Estimate #${estimate.estimateid.substring(0, 6)}`
                    }
                    currentRevisionId={currentRevision?.id}
                    currentVersion={currentRevision?.version}
                    onShareDocument={() => {}} // This will be implemented in the component
                  />
                </TabsContent>

                <TabsContent value="email" className="mt-0">
                  <EstimateEmailTab estimate={estimate} onEmailSent={handleRefresh} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <EstimateRevisionsTab
                    estimateId={estimate.estimateid}
                    revisions={displayRevisions}
                    currentRevisionId={currentRevision?.id}
                    onRevisionSelect={handleRevisionSelect}
                    projectId={estimate?.projectid}
                    convertedRevisionId={estimate?.converted_revision_id}
                    onRefresh={handleRefresh}
                    contingencyPercentage={estimate?.contingency_percentage}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialogs remain unchanged */}
        {/* Document share dialog */}
        <DocumentShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          document={
            currentRevision?.pdf_document_id
              ? {
                  document_id: currentRevision.pdf_document_id,
                }
              : null
          }
          estimateId={estimate.estimateid}
          clientEmail={estimate.contactemail}
        />

        {/* Revision creation dialog */}
        <EstimateRevisionDialog
          open={revisionDialogOpen}
          onOpenChange={setRevisionDialogOpen}
          estimateId={estimate.estimateid}
          currentVersion={currentRevision?.version || 1}
          onSuccess={handleRefresh}
        />

        {/* Convert to Project dialog */}
        <EstimateConvertDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          estimate={{
            id: estimate.estimateid,
            client: estimate.customername,
            project: estimate.projectname,
            description: estimate['job description'],
            location: {
              address: estimate.sitelocationaddress,
              city: estimate.sitelocationcity,
              state: estimate.sitelocationstate,
              zip: estimate.sitelocationzip,
            },
            amount: estimate.estimateamount,
            status: estimate.status,
          }}
          onStatusChange={handleStatusChange}
          onRefresh={handleRefresh}
        />
      </div>
    </PageTransition>
  );
};

export default EstimateDetailPage;
