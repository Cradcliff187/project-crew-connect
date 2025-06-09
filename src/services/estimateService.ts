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

// Helper function for robust item matching across revisions
const findMatchingItem = (
  itemToMatch: EstimateItem,
  itemList: EstimateItem[]
): EstimateItem | undefined => {
  // Priority 1 & 2: Match by ID linking (original_item_id <-> id)
  let match = itemList.find(
    otherItem =>
      (itemToMatch.original_item_id && otherItem.id === itemToMatch.original_item_id) ||
      (otherItem.original_item_id && otherItem.original_item_id === itemToMatch.id)
  );

  // Priority 3: Fallback to description match ONLY if no ID link found
  if (!match) {
    // Optional: Add console warning here if relying on description match
    // console.warn(`[compareEstimateRevisions] No ID match for item "${itemToMatch.description}", falling back to description match.`);
    match = itemList.find(otherItem => otherItem.description === itemToMatch.description);
  }

  return match;
};

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
    return !!data.projectid || data.status === 'CONVERTED';
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

  console.log(`Comparing revisions: ${revisionIdB} (RevB/Newer) vs ${revisionIdA} (RevA/Older)`);

  try {
    // 1. Fetch data (ensure correct IDs are used for A and B)
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
    const itemsA = (itemsAResult.data || []) as unknown as EstimateItem[];
    const itemsB = (itemsBResult.data || []) as unknown as EstimateItem[];

    console.log(`Fetched ${itemsB.length} items for Rev B, ${itemsA.length} for Rev A`);

    // --- CORRECTED Item Matching and Comparison Logic ---

    // Added: Items in B (Newer) that have no match in A (Older)
    const addedItems = itemsB.filter(itemB => !findMatchingItem(itemB, itemsA));

    // Removed: Items in A (Older) that have no match in B (Newer)
    const removedItems = itemsA.filter(itemA => !findMatchingItem(itemA, itemsB));

    // Changed: Items that have a match in both, but differ in specified fields
    const changedItems: ChangedItemDetail[] = [];
    itemsB.forEach(itemB => {
      const previousItem = findMatchingItem(itemB, itemsA); // Find corresponding item in Rev A
      if (previousItem) {
        // Only if item exists in both
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
          'subcontractor_id',
          'document_id',
        ];

        fieldsToCompare.forEach(field => {
          const valA = previousItem[field as keyof EstimateItem]; // Value from older revision
          const valB = itemB[field as keyof EstimateItem]; // Value from newer revision
          if (String(valA ?? '') !== String(valB ?? '')) {
            // Compare string representations after handling null/undefined
            changes.push({ field, previousValue: valA, currentValue: valB });
          }
        });

        if (changes.length > 0) {
          const priceDifference = (itemB.total_price || 0) - (previousItem.total_price || 0);
          const percentageDifference =
            previousItem.total_price && previousItem.total_price !== 0
              ? (priceDifference / previousItem.total_price) * 100
              : priceDifference !== 0
                ? Infinity
                : 0;

          changedItems.push({
            current: itemB,
            previous: previousItem,
            changes,
            priceDifference,
            percentageDifference,
          });
        }
      }
    });

    // --- Debug Logging ---
    addedItems.forEach(item =>
      console.log(`[Service DEBUG] ItemB ${item.id} (${item.description}) marked as ADDED`)
    );
    removedItems.forEach(item =>
      console.log(`[Service DEBUG] ItemA ${item.id} (${item.description}) marked as REMOVED`)
    );
    changedItems.forEach(item =>
      console.log(
        `[Service DEBUG] ItemPair (A:${item.previous.id}, B:${item.current.id}) marked as CHANGED`
      )
    );
    console.log(
      `[Service DEBUG Final Counts] Added: ${addedItems.length}, Removed: ${removedItems.length}, Changed: ${changedItems.length}`
    );

    // --- CORRECTED Summary Calculation ---
    const netAmountChange = (revisionB.amount || 0) - (revisionA.amount || 0); // Newer - Older
    let netItemsPriceChange = 0;
    addedItems.forEach(item => (netItemsPriceChange += item.total_price || 0));
    removedItems.forEach(item => (netItemsPriceChange -= item.total_price || 0));
    changedItems.forEach(detail => (netItemsPriceChange += detail.priceDifference));

    const result: RevisionComparisonResult = {
      revisionA, // Older
      revisionB, // Newer
      addedItems,
      removedItems,
      changedItems,
      summary: {
        totalItemsAdded: addedItems.length,
        totalItemsRemoved: removedItems.length,
        totalItemsChanged: changedItems.length,
        netAmountChange, // Should be positive if Rev B > Rev A
        netItemsPriceChange,
      },
    };

    console.log('Comparison generated:', result.summary); // Log the calculated summary
    return result;
  } catch (error: any) {
    console.error('Error comparing estimate revisions:', error);
    return null;
  }
}
