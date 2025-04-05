
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import EstimateDetail from '@/components/estimates/EstimateDetail';
import { Loader2 } from 'lucide-react';
import EstimatePDFManager from '@/components/estimates/detail/EstimatePDFManager';

const EstimateDetailPage = () => {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRevision, setCurrentRevision] = useState<any>(null);

  useEffect(() => {
    if (estimateId) {
      fetchEstimateData(estimateId);
    }
  }, [estimateId]);

  const fetchEstimateData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch the estimate data
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
        .single();
      
      if (revisionError && revisionError.code !== 'PGRST116') {
        console.error('Error fetching current revision:', revisionError);
      }
      
      // Fetch the estimate items (for the current revision if available)
      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', id)
        .order('created_at', { ascending: true });
      
      if (itemsError) {
        console.error('Error fetching estimate items:', itemsError);
      }
      
      // Set the data
      setEstimate({
        ...estimateData,
        items: itemsData || []
      });
      
      if (revisionData) {
        setCurrentRevision(revisionData);
      }
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
        
        {currentRevision && (
          <EstimatePDFManager 
            estimateId={estimate.estimateid} 
            revisionId={currentRevision.id} 
          />
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
