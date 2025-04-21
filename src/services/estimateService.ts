import { supabase } from '@/integrations/supabase/client';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';
import {
  RevisionComparisonResult,
  ItemChange,
  ChangedItemDetail,
} from '@/components/estimates/types/estimateTypes';

/**
 * Service for handling estimate operations
 */

/**
 * Convert an estimate to a project using the database function
 * This uses the convert_estimate_to_project database function
 * which handles all necessary status transitions and data validation
 *
 * If the database function fails, it falls back to a direct JavaScript implementation
 * @param estimateId The ID of the estimate to convert
 * @param revisionId Optional ID of a specific revision to convert (if not provided, uses current revision)
 */
export async function convertEstimateToProject(
  estimateId: string,
  revisionId?: string
): Promise<{
  success: boolean;
  projectId?: string;
  message?: string;
  revisionVersion?: number;
}> {
  console.log(
    `Converting estimate ${estimateId} via DB function (ignoring revisionId ${revisionId} if passed)...`
  );

  const params = { p_estimate_id: estimateId };
  console.log('[Service Params] Calling RPC convert_estimate_to_project with params:', params);

  const { data, error } = await (supabase.rpc as any)('convert_estimate_to_project', params);

  if (error) {
    console.error(
      '[Service Error] RPC convert_estimate_to_project FAILED. Error details:',
      JSON.stringify(error, null, 2)
    );
    return {
      success: false,
      message: error.message || 'Database function failed during conversion.',
    };
  }

  console.log(`Estimate converted successfully via DB function. Project ID: ${data}`);

  const revisionVersion = undefined; // Set version to undefined for now

  return {
    success: true,
    projectId: data as string,
    revisionVersion,
  };
}

/**
 * Update an estimate's status
 * This will follow the valid status transitions enforced by the database
 */
export async function updateEstimateStatus(
  estimateId: string,
  newStatus: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Updating estimate ${estimateId} status to ${newStatus}...`);

    const { error } = await supabase
      .from('estimates')
      .update({ status: newStatus })
      .eq('estimateid', estimateId);

    if (error) {
      console.error('Error updating estimate status:', error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log(`Estimate status updated successfully to ${newStatus}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating estimate status:', err);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Run the database validations script
 * This will create the necessary database functions and triggers
 */
export async function setupDatabaseValidations(): Promise<boolean> {
  try {
    // Dynamically import the script to run it
    await import('@/scripts/db-validations');
    return true;
  } catch (err) {
    console.error('Error setting up database validations:', err);
    return false;
  }
}

/**
 * Check if an estimate has already been converted to a project
 * @param estimateId The ID of the estimate to check
 * @returns True if the estimate has been converted, false otherwise
 */
export async function isEstimateConverted(estimateId: string): Promise<boolean> {
  try {
    // First check if the estimate has a projectid
    const { data, error } = await supabase
      .from('estimates')
      .select('projectid, status')
      .eq('estimateid', estimateId)
      .single();

    if (error) throw error;

    // If the estimate has a projectid or status is 'converted', it's been converted
    return !!data.projectid || data.status === 'converted';
  } catch (err) {
    console.error('Error checking if estimate is converted:', err);
    return false;
  }
}

/**
 * Compares two revisions of an estimate and details the changes in items.
 * @param revisionIdA The ID of the first revision (e.g., the older one).
 * @param revisionIdB The ID of the second revision (e.g., the newer one).
 * @returns A detailed comparison result or null if an error occurs.
 */
export async function compareEstimateRevisions(
  revisionIdA: string,
  revisionIdB: string
): Promise<RevisionComparisonResult | null> {
  if (!revisionIdA || !revisionIdB || revisionIdA === revisionIdB) {
    console.error('Invalid revision IDs provided for comparison.');
    return null;
  }

  console.log(`Comparing revisions: ${revisionIdA} (A) vs ${revisionIdB} (B)`);

  try {
    // 1. Fetch revision details and items concurrently
    const [revisionAResult, revisionBResult, itemsAResult, itemsBResult] = await Promise.all([
      supabase.from('estimate_revisions').select('*').eq('id', revisionIdA).single(),
      supabase.from('estimate_revisions').select('*').eq('id', revisionIdB).single(),
      supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionIdA)
        .order('created_at'),
      supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionIdB)
        .order('created_at'),
    ]);

    // Check for errors fetching revisions
    if (revisionAResult.error)
      throw new Error(
        `Failed to fetch revision A (${revisionIdA}): ${revisionAResult.error.message}`
      );
    if (revisionBResult.error)
      throw new Error(
        `Failed to fetch revision B (${revisionIdB}): ${revisionBResult.error.message}`
      );
    // Cast to EstimateRevision; assumes DB schema matches type
    const revisionA = revisionAResult.data as unknown as EstimateRevision;
    const revisionB = revisionBResult.data as unknown as EstimateRevision;

    // Check for errors fetching items
    if (itemsAResult.error)
      throw new Error(
        `Failed to fetch items for revision A (${revisionIdA}): ${itemsAResult.error.message}`
      );
    if (itemsBResult.error)
      throw new Error(
        `Failed to fetch items for revision B (${revisionIdB}): ${itemsBResult.error.message}`
      );
    // Cast to EstimateItem array; assumes DB schema matches type
    const itemsA = (itemsAResult.data || []) as unknown as EstimateItem[];
    const itemsB = (itemsBResult.data || []) as unknown as EstimateItem[];

    console.log(`Fetched ${itemsA.length} items for Rev A, ${itemsB.length} for Rev B`);

    // 2. Item Matching and Comparison Logic
    const itemsAMap = new Map<string, EstimateItem>(itemsA.map(item => [item.id, item]));
    const itemsBMap = new Map<string, EstimateItem>(itemsB.map(item => [item.id, item]));
    const matchedAIds = new Set<string>(); // Track IDs from itemsA that have been matched

    const addedItems: EstimateItem[] = [];
    const changedItems: ChangedItemDetail[] = [];

    for (const itemB of itemsB) {
      let matchFound = false;
      let previousItem: EstimateItem | null = null;

      // Primary match: original_item_id link pointing from B to A
      if (itemB.original_item_id && itemsAMap.has(itemB.original_item_id)) {
        previousItem = itemsAMap.get(itemB.original_item_id)!;
        if (previousItem) {
          matchedAIds.add(previousItem.id); // Mark the corresponding item in A as matched
          matchFound = true;
          console.log(`Matched itemB ${itemB.id} to itemA ${previousItem.id} via original_item_id`);
        }
      }

      // If no primary match, consider other matching strategies (optional)
      // Example: Secondary match based on description (use with caution, can be unreliable)
      /*
            if (!matchFound) {
                for (const itemA of itemsA) {
                    if (!matchedAIds.has(itemA.id) && itemA.description === itemB.description) {
                        previousItem = itemA;
                        matchedAIds.add(itemA.id);
                        matchFound = true;
                        console.log(`Matched itemB ${itemB.id} to itemA ${itemA.id} via description (Secondary)`);
                        break;
                    }
                }
            }
            */

      if (matchFound && previousItem) {
        // Item exists in both, compare fields for changes
        const changes: ItemChange[] = [];
        const fieldsToCompare: (keyof EstimateItem)[] = [
          'description',
          'quantity',
          'unit_price',
          'total_price',
          'cost',
          'markup_percentage',
          'markup_amount',
          'notes',
          'item_type',
          'vendor_id',
          'subcontractor_id', // Add other relevant fields
        ];

        fieldsToCompare.forEach(field => {
          // Handle potential null/undefined comparisons carefully
          const valA = previousItem![field as keyof EstimateItem];
          const valB = itemB[field as keyof EstimateItem];
          if (valA !== valB && !(valA == null && valB == null)) {
            // Basic check, allows null != undefined
            changes.push({
              field,
              previousValue: valA,
              currentValue: valB,
            });
          }
        });

        if (changes.length > 0) {
          const priceDifference = (itemB.total_price || 0) - (previousItem.total_price || 0);
          const percentageDifference =
            previousItem.total_price && previousItem.total_price !== 0
              ? (priceDifference / previousItem.total_price) * 100
              : priceDifference !== 0
                ? Infinity
                : 0; // Handle division by zero or zero base

          changedItems.push({
            current: itemB,
            previous: previousItem,
            changes,
            priceDifference,
            percentageDifference,
          });
          console.log(`Detected changes for item pair (A:${previousItem.id}, B:${itemB.id})`);
        }
      } else {
        // Item in B has no match in A -> Added item
        addedItems.push(itemB);
        console.log(`ItemB ${itemB.id} identified as ADDED`);
      }
    }

    // Find removed items: Items in A whose IDs were not marked as matched
    const removedItems = itemsA.filter(itemA => !matchedAIds.has(itemA.id));
    removedItems.forEach(item => console.log(`ItemA ${item.id} identified as REMOVED`));

    // DEBUG: Log array lengths before returning
    console.log(
      `[DEBUG Compare Logic] Added: ${addedItems.length}, Removed: ${removedItems.length}, Changed: ${changedItems.length}`
    );

    // 3. Calculate Summary
    const netAmountChange = (revisionB.amount || 0) - (revisionA.amount || 0);
    let netItemsPriceChange = 0;
    addedItems.forEach(item => (netItemsPriceChange += item.total_price || 0));
    removedItems.forEach(item => (netItemsPriceChange -= item.total_price || 0));
    changedItems.forEach(detail => (netItemsPriceChange += detail.priceDifference));

    const result: RevisionComparisonResult = {
      revisionA,
      revisionB,
      addedItems,
      removedItems,
      changedItems,
      summary: {
        totalItemsAdded: addedItems.length,
        totalItemsRemoved: removedItems.length,
        totalItemsChanged: changedItems.length,
        netAmountChange,
        netItemsPriceChange,
      },
    };

    console.log('Comparison generated:', result.summary);
    return result;
  } catch (error: any) {
    console.error('Error comparing estimate revisions:', error);
    // Depending on desired behavior, could toast here or let caller handle
    return null;
  }
}
