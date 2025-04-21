import { useState, useEffect } from 'react';
import { EstimateItem, EstimateRevision, EstimateRevisionComparison } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseRevisionComparisonOptions {
  estimateId: string;
  onError?: (error: Error) => void;
}

const useRevisionComparison = ({ estimateId, onError }: UseRevisionComparisonOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [compareRevisionId, setCompareRevisionId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<EstimateRevision[]>([]);
  const [comparisonData, setComparisonData] = useState<EstimateRevisionComparison | null>(null);
  const { toast } = useToast();

  // Fetch all revisions for the estimate
  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);

      // Set initially selected revision based on the DB flag
      const selectedRevision = data?.find(rev => rev.is_selected_for_view);
      if (selectedRevision) {
        setCurrentRevisionId(selectedRevision.id);

        // Set compare revision as the previous version if available
        if (data && data.length > 1) {
          const selectedIndex = data.findIndex(rev => rev.id === selectedRevision.id);
          const compareIndex = selectedIndex < data.length - 1 ? selectedIndex + 1 : 0;
          if (selectedIndex !== compareIndex) {
            setCompareRevisionId(data[compareIndex].id);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching revisions:', error);
      if (onError) onError(error);
      toast({
        title: 'Error',
        description: 'Failed to load estimate revisions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed comparison data between two revisions
  const compareRevisions = async (currentId: string, compareId: string) => {
    if (!currentId || !compareId || currentId === compareId) return;

    setIsLoading(true);
    try {
      // Fetch items for both revisions
      const [currentRevisionResult, compareRevisionResult, currentItemsResult, compareItemsResult] =
        await Promise.all([
          supabase.from('estimate_revisions').select('*').eq('id', currentId).single(),
          supabase.from('estimate_revisions').select('*').eq('id', compareId).single(),
          supabase.from('estimate_items').select('*').eq('revision_id', currentId),
          supabase.from('estimate_items').select('*').eq('revision_id', compareId),
        ]);

      if (currentRevisionResult.error) throw currentRevisionResult.error;
      if (compareRevisionResult.error) throw compareRevisionResult.error;
      if (currentItemsResult.error) throw currentItemsResult.error;
      if (compareItemsResult.error) throw compareItemsResult.error;

      const currentRevision = currentRevisionResult.data;
      const compareRevision = compareRevisionResult.data;

      // Convert database items to EstimateItem type safely by typing them as any first
      // This avoids TypeScript errors from string vs enum type mismatches
      const currentItems = (currentItemsResult.data || []) as any as EstimateItem[];
      const compareItems = (compareItemsResult.data || []) as any as EstimateItem[];

      // Process comparison data
      const addedItems = currentItems.filter(
        item =>
          !compareItems.some(
            ci =>
              ci.description === item.description ||
              ci.id === item.original_item_id ||
              item.id === ci.original_item_id
          )
      );

      const removedItems = compareItems.filter(
        item =>
          !currentItems.some(
            ci =>
              ci.description === item.description ||
              ci.id === item.original_item_id ||
              item.id === ci.original_item_id
          )
      );

      const changedItems = currentItems
        .map(currentItem => {
          const previousItem = compareItems.find(
            ci =>
              ci.description === currentItem.description ||
              ci.id === currentItem.original_item_id ||
              currentItem.original_item_id === ci.id
          );

          if (
            previousItem &&
            (currentItem.quantity !== previousItem.quantity ||
              currentItem.unit_price !== previousItem.unit_price ||
              currentItem.total_price !== previousItem.total_price)
          ) {
            // Calculate differences
            const priceDifference = currentItem.total_price - previousItem.total_price;
            const percentageDifference = previousItem.total_price
              ? (priceDifference / previousItem.total_price) * 100
              : 0;

            // Identify specific changes
            const changes = Object.keys(currentItem)
              .filter(
                key =>
                  currentItem[key as keyof EstimateItem] !==
                    previousItem[key as keyof EstimateItem] &&
                  key !== 'id' &&
                  key !== 'created_at' &&
                  key !== 'updated_at' &&
                  key !== 'revision_id'
              )
              .map(key => ({
                field: key,
                previousValue: previousItem[key as keyof EstimateItem],
                currentValue: currentItem[key as keyof EstimateItem],
              }));

            if (changes.length > 0) {
              return {
                current: currentItem,
                previous: previousItem,
                priceDifference,
                percentageDifference,
                changes,
              };
            }
          }
          return null;
        })
        .filter(Boolean) as any[];

      // Calculate total differences
      const currentTotal = currentRevision.amount || 0;
      const compareTotal = compareRevision.amount || 0;
      const totalDifference = currentTotal - compareTotal;
      const percentageChange = compareTotal ? (totalDifference / compareTotal) * 100 : 0;

      // Summary information
      const totalItemsChanged = addedItems.length + removedItems.length + changedItems.length;
      const newItemsCost = addedItems.reduce((sum, item) => sum + item.total_price, 0);
      const removedItemsCost = removedItems.reduce((sum, item) => sum + item.total_price, 0);
      const modifiedItemsDifference = changedItems.reduce(
        (sum, item) => sum + item.priceDifference,
        0
      );

      const comparison: EstimateRevisionComparison = {
        currentRevision,
        compareRevision,
        addedItems,
        removedItems,
        changedItems,
        totalDifference,
        percentageChange,
        summary: {
          totalItemsChanged,
          newItemsCost,
          removedItemsCost,
          modifiedItemsDifference,
        },
      };

      setComparisonData(comparison);
    } catch (error: any) {
      console.error('Error comparing revisions:', error);
      if (onError) onError(error);
      toast({
        title: 'Error',
        description: 'Failed to compare revisions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically compare revisions when both IDs are set
  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      compareRevisions(currentRevisionId, compareRevisionId);
    }
  }, [currentRevisionId, compareRevisionId]);

  // Initial fetch of revisions
  useEffect(() => {
    if (estimateId) {
      fetchRevisions();
    }
  }, [estimateId]);

  // Set current revision as active in the database
  const setRevisionAsCurrent = async (revisionId: string) => {
    setIsLoading(true);
    try {
      // First, clear current flag from all revisions for this estimate
      await supabase
        .from('estimate_revisions')
        .update({ is_selected_for_view: false })
        .eq('estimate_id', estimateId);

      // Then set the new current revision
      await supabase
        .from('estimate_revisions')
        .update({ is_selected_for_view: true })
        .eq('id', revisionId);

      // Update local state
      setCurrentRevisionId(revisionId);
      setRevisions(prev =>
        prev.map(rev => ({
          ...rev,
          is_selected_for_view: rev.id === revisionId,
        }))
      );

      toast({
        title: 'Success',
        description: 'Current revision updated',
      });
    } catch (error: any) {
      console.error('Error setting current revision:', error);
      if (onError) onError(error);
      toast({
        title: 'Error',
        description: 'Failed to update current revision',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    revisions,
    currentRevisionId,
    compareRevisionId,
    comparisonData,
    setCurrentRevisionId,
    setCompareRevisionId,
    fetchRevisions,
    compareRevisions,
    setRevisionAsCurrent,
  };
};

export default useRevisionComparison;
