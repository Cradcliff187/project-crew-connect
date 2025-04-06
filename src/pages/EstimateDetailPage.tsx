
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Send, FileUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import EstimateDetailContent from '@/components/estimates/detail/EstimateDetailContent';
import EstimateDocumentsTab from '@/components/estimates/details/EstimateDocumentsTab';
import EstimateEmailTab from '@/components/estimates/detail/EstimateEmailTab';
import EstimateRevisionsTab from '@/components/estimates/details/EstimateRevisionsTab';
import EstimateDetailLayout from '@/components/estimates/detail/EstimateDetailLayout';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';
import DocumentShareDialog from '@/components/estimates/detail/dialogs/DocumentShareDialog';
import EstimateStatusControl from '@/components/estimates/detail/EstimateStatusControl';
import EstimateActions from '@/components/estimates/EstimateActions';
import CompactEstimateSidebar from '@/components/estimates/detail/CompactEstimateSidebar';
import EstimateRevisionDialog from '@/components/estimates/detail/dialogs/EstimateRevisionDialog';
import CompactPDFManager from '@/components/estimates/detail/CompactPDFManager';

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
  
  // Use the custom hook for fetching estimate details
  const { 
    estimateRevisions,
    fetchEstimateDetails,
    isLoading: revisionsLoading,
    refetchRevisions,
    setRevisionAsCurrent
  } = useEstimateDetails();

  useEffect(() => {
    if (estimateId) {
      fetchEstimateData(estimateId);
      // Also fetch revisions using the custom hook
      fetchEstimateDetails(estimateId);
    }
  }, [estimateId]);

  const fetchEstimateData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the estimate data with error handling
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', id)
        .single();
      
      if (estimateError) {
        throw estimateError;
      }
      
      // Fetch the current revision
      const { data: revisionData, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', id)
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .single();
      
      if (revisionError && revisionError.code !== 'PGRST116') {
        console.error('Error fetching current revision:', revisionError);
        // If we couldn't find a revision marked as current, try to get the latest one
        const { data: latestRevision, error: latestRevisionError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', id)
          .order('version', { ascending: false })
          .limit(1)
          .single();
          
        if (!latestRevisionError) {
          setCurrentRevision(latestRevision);
          
          // Mark this revision as current
          await supabase
            .from('estimate_revisions')
            .update({ is_current: true })
            .eq('id', latestRevision.id);
            
          toast({
            title: "Revision Updated",
            description: "The latest revision has been marked as current.",
            variant: "default"
          });
        } else {
          // Create a new revision if none exists
          if (latestRevisionError.code === 'PGRST116') {
            const { data: newRevision, error: newRevisionError } = await supabase
              .from('estimate_revisions')
              .insert({
                estimate_id: id,
                version: 1,
                is_current: true,
                revision_date: new Date().toISOString(),
                amount: estimateData.estimateamount,
                status: estimateData.status
              })
              .select()
              .single();
              
            if (newRevisionError) {
              console.error('Error creating new revision:', newRevisionError);
            } else {
              setCurrentRevision(newRevision);
              
              toast({
                title: "New Revision Created",
                description: "A new revision has been created for this estimate.",
                variant: "default"
              });
            }
          }
        }
      } else if (revisionData) {
        setCurrentRevision(revisionData);
      }
      
      // Fetch the estimate items (for the current revision if available)
      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', id)
        .eq('revision_id', currentRevision?.id || revisionData?.id)
        .order('created_at', { ascending: true });
      
      if (itemsError) {
        console.error('Error fetching estimate items:', itemsError);
      }
      
      // Fetch all revisions for this estimate
      const { data: allRevisions, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', id)
        .order('version', { ascending: false });
      
      if (revisionsError) {
        console.error('Error fetching estimate revisions:', revisionsError);
      } else {
        setRevisions(allRevisions || []);
      }
      
      // Set the data
      setEstimate({
        ...estimateData,
        items: itemsData || [],
        currentRevision: currentRevision || revisionData
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

  const handleStatusChange = () => {
    handleRefresh();
  };

  const handleDelete = async () => {
    // Implementation for deleting the estimate would go here
    // After successful delete, navigate back to the list
    handleBackClick();
  };

  const handleConvert = async () => {
    // Implementation for converting the estimate to a project would go here
    // After successful conversion, refresh the data
    handleRefresh();
  };

  const handleRevisionSelect = async (revisionId: string) => {
    const selectedRevision = (estimateRevisions.length > 0 ? estimateRevisions : revisions)
      .find(rev => rev.id === revisionId);
    
    if (selectedRevision) {
      setCurrentRevision(selectedRevision);
      
      if (!selectedRevision.is_current && estimateId) {
        // First set this as the current revision in database
        await setRevisionAsCurrent(revisionId, estimateId);
      }
      
      toast({
        title: `Viewing Revision ${selectedRevision.version}`,
        description: selectedRevision.is_current ? "This is the current revision" : "This revision is now set as current",
      });
      
      // Fetch items for this specific revision
      if (estimateId) {
        // Fetch items for this specific revision
        supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('revision_id', revisionId)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching revision items:', error);
              return;
            }
            
            setEstimate(prev => ({
              ...prev,
              items: data || [],
              currentRevision: selectedRevision
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
          <Button 
            variant="outline" 
            onClick={handleBackClick} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>
          
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Estimate</h1>
                <p className="mt-2 text-gray-600">{error || 'Estimate not found'}</p>
                <Button 
                  onClick={handleBackClick} 
                  className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]"
                >
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
  
  const canCreateRevision = ['draft', 'sent', 'pending', 'approved', 'rejected'].includes(estimate.status);

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Header Section with Back Button, Status Control and Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={handleBackClick}
              size="sm"
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">Estimate #{estimate.estimateid.substring(4, 10)}</h1>
                <EstimateStatusControl 
                  estimateId={estimate.estimateid}
                  currentStatus={estimate.status}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {estimate.customername || 'No customer'} • Created {new Date(estimate.datecreated).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-end">
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
            
            {estimate.status === 'draft' && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            )}
            
            <EstimateActions 
              status={estimate.status}
              onEdit={() => {}}
              onDelete={handleDelete}
              onConvert={handleConvert}
            />
          </div>
        </div>
        
        {/* PDF Manager (Compact Version) */}
        {currentRevision && (
          <CompactPDFManager 
            estimateId={estimate.estimateid} 
            revisionId={currentRevision.id}
            clientEmail={estimate.contactemail}
            onOpenShareDialog={() => setShareDialogOpen(true)}
          />
        )}
        
        {/* Main Content */}
        <EstimateDetailLayout
          sidebar={
            <CompactEstimateSidebar
              estimate={estimate}
              revisions={displayRevisions}
              currentRevisionId={currentRevision?.id}
              onRevisionSelect={handleRevisionSelect}
            />
          }
          main={
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
                      <EstimateDetailContent 
                        data={estimate}
                        onRefresh={handleRefresh}
                      />
                    </TabsContent>
                    
                    <TabsContent value="documents" className="mt-0">
                      <EstimateDocumentsTab 
                        estimateId={estimate.estimateid} 
                        onShareDocument={() => {}} // This will be implemented in the component
                      />
                    </TabsContent>
                    
                    <TabsContent value="email" className="mt-0">
                      <EstimateEmailTab 
                        estimate={estimate}
                        onEmailSent={handleRefresh}
                      />
                    </TabsContent>
                    
                    <TabsContent value="history" className="mt-0">
                      <EstimateRevisionsTab
                        estimateId={estimate.estimateid}
                        revisions={displayRevisions}
                        currentRevisionId={currentRevision?.id}
                        onRevisionSelect={handleRevisionSelect}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          }
        />
        
        {/* Document share dialog */}
        <DocumentShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          document={currentRevision?.pdf_document_id ? {
            document_id: currentRevision.pdf_document_id
          } : null}
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
      </div>
    </PageTransition>
  );
};

export default EstimateDetailPage;
