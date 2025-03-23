
import { supabase } from '@/integrations/supabase/client';

export async function convertEstimateItemsToBudgetItems(estimateId: string, projectId: string) {
  try {
    // Fetch the estimate items from expenses table
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

export async function createBudgetFromEstimate(projectId: string, estimateId: string) {
  return await convertEstimateItemsToBudgetItems(estimateId, projectId);
}

export async function linkWorkOrderToProject(workOrderId: string, projectId: string, budgetItemId?: string) {
  try {
    // Call the Supabase function to link the work order to the project
    const { data, error } = await supabase.rpc('link_work_order_to_project', {
      p_work_order_id: workOrderId,
      p_project_id: projectId,
      p_budget_item_id: budgetItemId || null
    });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error linking work order to project:", error);
    return false;
  }
}

export async function importWorkOrderCostsToProject(workOrderId: string, projectId: string) {
  try {
    // Get all expenses for this work order
    const { data: workOrderExpenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('entity_type', 'WORK_ORDER')
      .eq('entity_id', workOrderId);

    if (error) throw error;
    
    if (!workOrderExpenses || workOrderExpenses.length === 0) {
      return { success: false, message: "No expenses found for this work order" };
    }
    
    // Convert work order expenses to project expenses
    const projectExpenses = workOrderExpenses.map(expense => ({
      entity_type: 'PROJECT',
      entity_id: projectId,
      description: `[WO: ${workOrderId}] ${expense.description}`,
      expense_type: expense.expense_type,
      amount: expense.amount,
      quantity: expense.quantity,
      unit_price: expense.unit_price,
      vendor_id: expense.vendor_id,
      is_billable: expense.is_billable,
      expense_date: expense.expense_date,
      document_id: expense.document_id,
      budget_item_id: null // This would need to be set if you want to associate with a specific budget item
    }));
    
    // Insert as project expenses
    const { error: insertError } = await supabase
      .from('expenses')
      .insert(projectExpenses);
      
    if (insertError) throw insertError;
    
    return { success: true, message: `${projectExpenses.length} expenses imported to project` };
  } catch (error: any) {
    console.error("Error importing work order costs to project:", error);
    return { success: false, message: error.message };
  }
}
