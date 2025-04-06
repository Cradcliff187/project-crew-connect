
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

import EstimateDetailHeader from '@/components/estimates/detail/EstimateDetailHeader';
import EstimateDetailContent from '@/components/estimates/detail/EstimateDetailContent';
import EstimatePDFManager from '@/components/estimates/detail/EstimatePDFManager';
import EstimateRevisionsList from '@/components/estimates/detail/EstimateRevisionsList';
import EstimateDocumentsTab from '@/components/estimates/details/EstimateDocumentsTab';
import EstimateEmailTab from '@/components/estimates/detail/EstimateEmailTab';
import EstimateRevisionsTab from '@/components/estimates/details/EstimateRevisionsTab';
import EstimateDetailLayout from '@/components/estimates/detail/EstimateDetailLayout';
import EstimateSidebar from '@/components/estimates/detail/EstimateSidebar';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';
import DocumentShareDialog from '@/components/estimates/detail/dialogs/DocumentShareDialog';

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
  
  // Use the custom hook for fetching estimate details
  const { 
    estimateRevisions,
    fetchEstimateDetails,
    isLoading: revisionsLoading,
    refetchRevisions
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

  const handleRevisionSelect = (revisionId: string) => {
    const selectedRevision = (estimateRevisions.length > 0 ? estimateRevisions : revisions)
      .find(rev => rev.id === revisionId);
    
    if (selectedRevision) {
      setCurrentRevision(selectedRevision);
      toast({
        title: `Viewing Revision ${selectedRevision.version}`,
        description: selectedRevision.is_current ? "This is the current revision" : "This is a historical revision",
      });
      
      // If we're viewing a revision that isn't current, maybe fetch its items?
      if (!selectedRevision.is_current && estimateId) {
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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>
          
          <EstimateDetailHeader 
            data={{
              estimateid: estimate.estimateid,
              customername: estimate.customername,
              datecreated: estimate.datecreated,
              status: estimate.status
            }}
            currentVersion={currentRevision?.version || 1}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onStatusChange={handleStatusChange}
          />
        </div>
        
        {currentRevision && (
          <EstimatePDFManager 
            estimateId={estimate.estimateid} 
            revisionId={currentRevision.id}
            clientEmail={estimate.contactemail}
          />
        )}
        
        <EstimateDetailLayout
          sidebar={
            <EstimateSidebar
              estimate={estimate}
              revisions={displayRevisions}
              currentRevisionId={currentRevision?.id}
              onRevisionSelect={handleRevisionSelect}
              onShare={() => setShareDialogOpen(true)}
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
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Estimate History</h2>
                        <p className="text-muted-foreground">Activity history for this estimate will be displayed here.</p>
                        {/* Implement history log component here */}
                      </div>
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
      </div>
    </PageTransition>
  );
};

export default EstimateDetailPage;
