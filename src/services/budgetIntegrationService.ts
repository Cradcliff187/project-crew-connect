import { supabase } from '@/integrations/supabase/client';

// Define an internal type to handle type discrepancies between frontend and database
interface EstimateItemWithExtendedFields {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost: number;
  markup_percentage: number;
  item_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  // These fields might not exist in the database but are used in the frontend
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
}

export async function convertEstimateItemsToBudgetItems(estimateId: string, projectId: string) {
  try {
    // Fetch the estimate items from the estimate_items table
    const { data: estimateItems, error } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId);

    if (error) throw error;
    if (!estimateItems || estimateItems.length === 0)
      return { success: false, message: 'No estimate items found' };

    // Map estimate items to budget items format with improved categorization
    const budgetItems = estimateItems.map((item: any) => {
      // Cast item to our extended type for safe property access
      const extendedItem = item as EstimateItemWithExtendedFields;

      // Determine the category based on item_type
      let category = extendedItem.item_type || 'Uncategorized';

      if (extendedItem.item_type === 'subcontractor') {
        // For subcontractors, use trade_type (specialty) as category if available
        if (extendedItem.trade_type) {
          if (extendedItem.trade_type === 'other' && extendedItem.custom_type) {
            category = `Subcontractor - ${extendedItem.custom_type}`;
          } else {
            // We'll look up the specialty name in the UI
            category = `Subcontractor - ${extendedItem.trade_type}`;
          }
        } else {
          category = 'Subcontractor - General';
        }
      } else if (extendedItem.item_type === 'vendor' && extendedItem.expense_type) {
        // For vendors, use expense_type as category if available
        if (extendedItem.expense_type === 'other' && extendedItem.custom_type) {
          category = `Material - ${extendedItem.custom_type}`;
        } else {
          // Capitalize the first letter
          const formattedType =
            extendedItem.expense_type.charAt(0).toUpperCase() + extendedItem.expense_type.slice(1);
          category = `Material - ${formattedType}`;
        }
      } else if (extendedItem.item_type === 'labor') {
        category = 'Labor';
      }

      return {
        project_id: projectId,
        category: category,
        description: extendedItem.description || '',
        estimated_amount: extendedItem.total_price || 0,
        actual_amount: 0,
      };
    });

    // Create budget items in project_budget_items table
    const { error: insertError } = await supabase.from('project_budget_items').insert(budgetItems);

    if (insertError) throw insertError;

    return { success: true, message: `${budgetItems.length} budget items created` };
  } catch (error: any) {
    console.error('Error converting estimate to budget:', error);
    return { success: false, message: error.message };
  }
}

export async function createBudgetFromEstimate(projectId: string, estimateId: string) {
  return await convertEstimateItemsToBudgetItems(estimateId, projectId);
}

export async function linkWorkOrderToProject(
  workOrderId: string,
  projectId: string,
  budgetItemId?: string
) {
  try {
    // Call the Supabase function to link the work order to the project
    const { data, error } = await supabase.rpc('link_work_order_to_project', {
      p_work_order_id: workOrderId,
      p_project_id: projectId,
      p_budget_item_id: budgetItemId || null,
    });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error linking work order to project:', error);
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
      return { success: false, message: 'No expenses found for this work order' };
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
      budget_item_id: null, // This would need to be set if you want to associate with a specific budget item
    }));

    // Insert as project expenses
    const { error: insertError } = await supabase.from('expenses').insert(projectExpenses);

    if (insertError) throw insertError;

    return { success: true, message: `${projectExpenses.length} expenses imported to project` };
  } catch (error: any) {
    console.error('Error importing work order costs to project:', error);
    return { success: false, message: error.message };
  }
}
