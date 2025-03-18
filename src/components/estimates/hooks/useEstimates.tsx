
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateType } from '../EstimatesTable';

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const { data: estimatesData, error } = await supabase
        .from('estimates')
        .select(`
          estimateid,
          customername,
          projectname,
          datecreated,
          estimateamount,
          status,
          "job description",
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate,
          sitelocationzip,
          customerid,
          projectid
        `)
        .order('datecreated', { ascending: false });

      if (error) {
        throw error;
      }

      const { data: revisionCountsData, error: revisionsError } = await supabase
        .from('estimate_revisions')
        .select('estimate_id, count', { count: 'exact' });

      if (revisionsError) {
        console.error('Error fetching revision counts:', revisionsError);
      }

      const revisionCounts: Record<string, number> = {};
      if (revisionCountsData) {
        revisionCountsData.forEach((item) => {
          revisionCounts[item.estimate_id] = item.count || 0;
        });
      }

      const formattedEstimates = estimatesData.map(estimate => {
        const revisionCount = revisionCounts[estimate.estimateid] || 0;
        
        return {
          id: estimate.estimateid,
          client: estimate.customername || 'Unknown Client',
          project: estimate.projectname || 'Unnamed Project',
          date: estimate.datecreated || new Date().toISOString(),
          amount: Number(estimate.estimateamount) || 0,
          status: estimate.status || 'draft',
          versions: Number(revisionCount) + 1,
          description: estimate["job description"],
          location: {
            address: estimate.sitelocationaddress,
            city: estimate.sitelocationcity,
            state: estimate.sitelocationstate,
            zip: estimate.sitelocationzip
          }
        };
      });

      setEstimates(formattedEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast({
        title: "Error",
        description: "Failed to load estimates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  return {
    estimates,
    loading,
    fetchEstimates
  };
};
