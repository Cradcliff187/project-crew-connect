import { useState, useEffect } from 'react';
import { StatusType } from '@/types/common';
import { supabase } from '@/integrations/supabase/client';
import { EstimateType } from '../EstimatesTable';
import { EstimateRevision } from '../types/estimateTypes';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define the expected structure from the RPC call
// interface EstimateWithLatestRevision extends EstimateType {
//   latest_revision_date?: string;
// }

// Define the query key
const estimatesQueryKey = ['estimates'];

// Function to fetch estimates
const fetchEstimatesData = async (): Promise<EstimateType[]> => {
  console.log('[useEstimates] fetchEstimatesData called');

  // 1. Fetch base estimate data
  const selectString = `
    estimateid,
    customerid,
    projectname,
    datecreated,
    estimateamount,
    status,
    contingency_percentage,
    sitelocationaddress,
    sitelocationcity,
    sitelocationstate,
    sitelocationzip,
    "job description",
    customers ( customername )
  `;
  const { data: estimatesData, error: estimatesError } = await supabase
    .from('estimates')
    .select(selectString)
    .order('datecreated', { ascending: false });

  if (estimatesError) {
    console.error('[useEstimates] Error fetching estimates:', estimatesError);
    toast({ title: 'Error', description: 'Failed to load estimates', variant: 'destructive' });
    throw new Error(estimatesError.message || 'Failed to load estimates');
  }

  if (!estimatesData) {
    return [];
  }

  const estimateIds = estimatesData.map(e => e.estimateid).filter(id => !!id);

  // 2. Fetch latest revisions for these estimates if IDs exist
  const latestRevisionAmounts = new Map<string, number>();
  const latestRevisionDates = new Map<string, string>();

  if (estimateIds.length > 0) {
    const { data: revisionsData, error: revisionsError } = await supabase
      .from('estimate_revisions')
      .select('estimate_id, version, amount, revision_date')
      .in('estimate_id', estimateIds)
      .order('version', { ascending: false });

    if (revisionsError) {
      console.error('[useEstimates] Error fetching revisions:', revisionsError);
      toast({
        title: 'Warning',
        description: 'Could not fetch latest revision details.',
        variant: 'default',
      });
    } else if (revisionsData) {
      const latestRevisions = new Map<string, { version: number; amount: number; date: string }>();
      for (const revision of revisionsData) {
        const existing = latestRevisions.get(revision.estimate_id);
        if (!existing) {
          latestRevisions.set(revision.estimate_id, {
            version: revision.version,
            amount: revision.amount,
            date: revision.revision_date,
          });
        }
      }
      latestRevisions.forEach((value, key) => {
        latestRevisionAmounts.set(key, value.amount);
        latestRevisionDates.set(key, value.date);
      });
    }
  }

  // 3. Map estimates data, incorporating latest revision amount and date
  const formattedEstimates: EstimateType[] = estimatesData
    .map((estimate: any): EstimateType | null => {
      if (!estimate.estimateid) return null;
      const estimateIdStr = estimate.estimateid as string;
      try {
        const customerName =
          estimate.customers?.customername || estimate.customername || 'No Client';

        const finalAmount =
          latestRevisionAmounts.get(estimateIdStr) ?? estimate.estimateamount ?? 0;
        const finalDate =
          latestRevisionDates.get(estimateIdStr) ||
          estimate.datecreated ||
          new Date().toISOString();

        const formatted: EstimateType = {
          id: estimateIdStr,
          customerId: estimate.customerid || '',
          client: customerName,
          project: estimate.projectname || `Estimate ${estimateIdStr.substring(0, 6)}`,
          date: estimate.datecreated || new Date().toISOString(),
          amount: finalAmount,
          status: (estimate.status as StatusType) || 'draft',
          versions: 0, // Placeholder
          description: estimate['job description'],
          location: {
            address: estimate.sitelocationaddress,
            city: estimate.sitelocationcity,
            state: estimate.sitelocationstate,
            zip: estimate.sitelocationzip,
          },
          latestRevisionDate: finalDate,
        };
        return formatted;
      } catch (mapError: any) {
        console.error(
          `[useEstimates] Error mapping item (ID: ${estimateIdStr}):`,
          mapError,
          'Raw item:',
          estimate
        );
        return null;
      }
    })
    .filter((estimate): estimate is EstimateType => estimate !== null);

  console.log('[useEstimates] Returning formatted estimates:', formattedEstimates);
  return formattedEstimates;
};

export const useEstimates = () => {
  // const [estimates, setEstimates] = useState<EstimateType[]>([]); // Managed by useQuery
  // const [loading, setLoading] = useState(true); // Managed by useQuery
  // const [error, setError] = useState<string | null>(null); // Managed by useQuery

  const {
    data: estimates = [], // Default to empty array
    isLoading: loading,
    error,
    refetch: fetchEstimates, // Expose refetch if manual refresh is needed elsewhere
  } = useQuery<EstimateType[], Error>({
    queryKey: estimatesQueryKey,
    queryFn: fetchEstimatesData,
    // staleTime: 5 * 60 * 1000, // Optional: Keep data fresh for 5 minutes
  });

  // Convert error object to string message for easier consumption
  const errorMessage = error ? error.message : null;

  // useEffect(() => { // No longer needed, useQuery handles fetching on mount/focus/etc.
  //   fetchEstimates();
  // }, []);

  return { estimates, loading, error: errorMessage, fetchEstimates };
};
