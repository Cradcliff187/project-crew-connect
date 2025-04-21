import { useState, useEffect } from 'react';
import { StatusType } from '@/types/common';
import { supabase } from '@/integrations/supabase/client';
import { EstimateType } from '../EstimatesTable';
import { toast } from '@/hooks/use-toast';

// Define the expected structure from the RPC call
interface EstimateWithLatestRevision extends EstimateType {
  latest_revision_date?: string;
}

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the database function to get estimates with the latest revision date
      // Specify 'any' for the return type initially, as we will map it manually
      const { data, error } = await supabase.rpc('get_estimates_with_latest_revision_date');
      // Note: We will need to create the 'get_estimates_with_latest_revision_date'
      // function in the database separately.

      if (error) {
        throw error;
      }

      // Ensure data is an array before mapping
      if (!data || !Array.isArray(data)) {
        console.warn('RPC call did not return an array:', data);
        setEstimates([]);
        return;
      }

      // Format the data for the UI
      // Assume the RPC function returns an array of objects matching EstimateWithLatestRevision structure
      const formattedEstimates: EstimateType[] = data.map((estimate: any) => ({
        id: estimate.id || estimate.estimateid, // Handle potential id variations
        customerId: estimate.customerid || '',
        client: estimate.customername || 'Unknown Client',
        project: estimate.projectname || `Estimate ${estimate.id || estimate.estimateid}`,
        date: estimate.datecreated || new Date().toISOString(), // Use original creation date
        latestRevisionDate:
          estimate.latest_revision_date || estimate.datecreated || new Date().toISOString(), // Use latest revision date, fallback to creation date
        amount: estimate.estimateamount || 0,
        status: (estimate.status as StatusType) || 'draft',
        versions: estimate.versions || 0, // Assuming RPC returns version count
        description: estimate['job description'] || estimate.description,
        location: {
          address: estimate.sitelocationaddress,
          city: estimate.sitelocationcity,
          state: estimate.sitelocationstate,
          zip: estimate.sitelocationzip,
        },
      }));

      // Sort by latest revision date descending before setting state
      formattedEstimates.sort((a, b) => {
        const dateA = a.latestRevisionDate ? new Date(a.latestRevisionDate).getTime() : 0;
        const dateB = b.latestRevisionDate ? new Date(b.latestRevisionDate).getTime() : 0;
        return dateB - dateA; // Descending order
      });

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
