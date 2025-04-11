
import { useState, useEffect } from 'react';
import { StatusType } from '@/types/common';
import { supabase } from '@/integrations/supabase/client';
import { EstimateType } from '../EstimatesTable';
import { toast } from '@/hooks/use-toast';

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEstimates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all estimates with their current revision version
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          estimateid,
          customerid,
          customername,
          projectname,
          "job description",
          estimateamount,
          contingencyamount,
          contingency_percentage,
          datecreated,
          sentdate,
          approveddate,
          status,
          sitelocationaddress,
          sitelocationcity,
          sitelocationstate,
          sitelocationzip
        `)
        .order('datecreated', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Get revision counts for each estimate
      const revisionsPromises = data.map(async (estimate) => {
        const { count, error: countError } = await supabase
          .from('estimate_revisions')
          .select('id', { count: 'exact', head: true })
          .eq('estimate_id', estimate.estimateid);
          
        if (countError) {
          console.error('Error fetching revision count:', countError);
          return 0;
        }
        
        return count || 0;
      });
      
      const revisionCounts = await Promise.all(revisionsPromises);
      
      // Format the data for the UI, preserving both ID and name separately
      const formattedEstimates: EstimateType[] = data.map((estimate, index) => ({
        id: estimate.estimateid,
        customerId: estimate.customerid || '', // Store customer ID separately
        client: estimate.customername || 'Unknown Client', // Use name for display
        project: estimate.projectname || `Estimate ${estimate.estimateid}`,
        date: estimate.datecreated || new Date().toISOString(),
        amount: estimate.estimateamount || 0,
        status: estimate.status as StatusType || 'draft',
        versions: revisionCounts[index],
        description: estimate["job description"],
        location: {
          address: estimate.sitelocationaddress,
          city: estimate.sitelocationcity,
          state: estimate.sitelocationstate,
          zip: estimate.sitelocationzip
        }
      }));
      
      setEstimates(formattedEstimates);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      setError(error.message || 'Failed to load estimates');
      toast({
        title: 'Error',
        description: 'Failed to load estimates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEstimates();
  }, []);
  
  return { estimates, loading, error, fetchEstimates };
};
