
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import EstimateDetail from '@/components/estimates/EstimateDetail';
import { Loader2 } from 'lucide-react';
import EstimatePDFManager from '@/components/estimates/detail/EstimatePDFManager';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const EstimateDetailPage = () => {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRevision, setCurrentRevision] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (estimateId) {
      fetchEstimateData(estimateId);
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
      
      // Set the data
      setEstimate({
        ...estimateData,
        items: itemsData || []
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
          <h1 className="text-2xl font-bold">Error Loading Estimate</h1>
          <p className="text-red-500">{error || 'Estimate not found'}</p>
          <button 
            onClick={() => navigate('/estimates')} 
            className="px-4 py-2 bg-[#0485ea] text-white rounded-md hover:bg-[#0373ce]"
          >
            Back to Estimates
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Estimate Details</h1>
        
        {currentRevision ? (
          <EstimatePDFManager 
            estimateId={estimate.estimateid} 
            revisionId={currentRevision.id} 
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground">No revisions found for this estimate</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <EstimateDetail 
          data={estimate}
          onRefresh={handleRefresh}
        />
      </div>
    </PageTransition>
  );
};

export default EstimateDetailPage;
