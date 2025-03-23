
// Update the budget integration service to use correct tables and types

import { supabase } from '@/integrations/supabase/client';

export async function convertEstimateItemsToBudgetItems(estimateId: string, projectId: string) {
  try {
    // Fetch the estimate items directly from expenses table
    const { data: estimateItems, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('entity_type', 'ESTIMATE')
      .eq('entity_id', estimateId);

    if (error) throw error;
    if (!estimateItems || estimateItems.length === 0) return { success: false, message: "No estimate items found" };

    // Map estimate items to budget items format
    const budgetItems = estimateItems.map(item => ({
      project_id: projectId,
      category: item.expense_type || "Uncategorized",
      description: item.description || "",
      estimated_amount: item.amount || 0,
      actual_amount: 0
    }));

    // Create budget items in project_budget_items table
    const { error: insertError } = await supabase
      .from('project_budget_items')
      .insert(budgetItems);

    if (insertError) throw insertError;

    return { success: true, message: `${budgetItems.length} budget items created` };
  } catch (error: any) {
    console.error("Error converting estimate to budget:", error);
    return { success: false, message: error.message };
  }
}
