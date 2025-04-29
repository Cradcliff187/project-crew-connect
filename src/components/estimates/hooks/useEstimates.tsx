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

      // --- Replace RPC Call with Direct Query ---
      const { data, error } = await supabase
        .from('estimates')
        .select(
          `
          estimateid,
          customerid,
          projectname,
          datecreated,
          estimateamount,
          status,
          customers ( customername )
        `
        )
        .order('datecreated', { ascending: false }); // Simple ordering for now

      if (error) {
        throw error;
      }

      if (!data) {
        setEstimates([]);
        return;
      }

      // --- Updated Mapping Logic ---
      const formattedEstimates: EstimateType[] = data
        .map((estimate: any): EstimateType | null => {
          // Critical Check: Ensure estimateid exists
          if (!estimate.estimateid) {
            console.warn('Fetched estimate record is missing estimateid:', estimate);
            return null; // Mark for filtering
          }
          // Ensure customer data is handled correctly (can be null from LEFT JOIN)
          const customerName =
            estimate.customers?.customername || estimate.customername || 'No Client';
          const estimateIdStr = estimate.estimateid as string; // Assert as string after check

          // Construct the object carefully matching EstimateType
          const formatted: EstimateType = {
            id: estimateIdStr,
            customerId: estimate.customerid || '',
            client: customerName,
            project: estimate.projectname || `Estimate ${estimateIdStr.substring(0, 6)}`,
            date: estimate.datecreated || new Date().toISOString(),
            amount: estimate.estimateamount || 0,
            status: (estimate.status as StatusType) || 'draft',
            // Handle optional fields explicitly
            versions: 0, // Placeholder, needs proper calculation later if required by EstimateType
            description: estimate['job description'] || estimate.description,
            location: {
              address: estimate.sitelocationaddress,
              city: estimate.sitelocationcity,
              state: estimate.sitelocationstate,
              zip: estimate.sitelocationzip,
            },
            // Assign latestRevisionDate only if it exists or fallback, matching potential optionality
            latestRevisionDate: estimate.latest_revision_date || estimate.datecreated || undefined,
          };
          // If estimate.customers was only for the join, remove it if not part of EstimateType
          // delete (formatted as any).customers;

          return formatted;
        })
        .filter((estimate): estimate is EstimateType => estimate !== null); // Type predicate should work now

      // We can re-add sorting later if needed, focus on getting IDs first
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
