
import { supabase } from '@/integrations/supabase/client';

// Function to create budget items from an estimate
export const createBudgetFromEstimate = async (projectId: string, estimateId: string): Promise<boolean> => {
  try {
    console.log(`Creating budget from estimate: ${estimateId} for project: ${projectId}`);
    
    // Get the estimate items
    const { data: estimateItems, error: itemsError } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId);
      
    if (itemsError) {
      console.error('Error getting estimate items:', itemsError);
      return false;
    }
    
    if (!estimateItems || estimateItems.length === 0) {
      console.warn('No estimate items found to create budget items from');
      return false;
    }
    
    // Create budget items for each estimate item
    const budgetItems = estimateItems.map(item => ({
      project_id: projectId,
      description: item.description,
      category: item.item_type || 'OTHER',
      estimated_amount: item.total_price,
      actual_amount: 0
    }));
    
    // Insert the budget items
    const { error: insertError } = await supabase
      .from('project_budget_items')
      .insert(budgetItems);
      
    if (insertError) {
      console.error('Error inserting budget items:', insertError);
      return false;
    }
    
    console.log(`${budgetItems.length} budget items created successfully`);
    return true;
    
  } catch (error) {
    console.error('Error in createBudgetFromEstimate:', error);
    return false;
  }
};

// Function to link a work order to a project budget item
export const linkWorkOrderToProject = async (
  workOrderId: string, 
  projectId: string, 
  budgetItemId?: string
): Promise<boolean> => {
  try {
    // Call the database function to create the link
    const { data, error } = await supabase
      .rpc('link_work_order_to_project', {
        p_work_order_id: workOrderId,
        p_project_id: projectId,
        p_budget_item_id: budgetItemId || null
      });
      
    if (error) {
      console.error('Error linking work order to project:', error);
      return false;
    }
    
    return data || false;
    
  } catch (error) {
    console.error('Error in linkWorkOrderToProject:', error);
    return false;
  }
};

// Function to import work order costs to a project
export const importWorkOrderCostsToProject = async (
  workOrderId: string,
  projectId: string
): Promise<boolean> => {
  try {
    // Get work order details
    const { data: workOrder, error: workOrderError } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .eq('work_order_id', workOrderId)
      .single();
      
    if (workOrderError) {
      console.error('Error getting work order:', workOrderError);
      return false;
    }
    
    // Get the link details to see if there's a budget item
    const { data: linkData, error: linkError } = await supabase
      .rpc('get_work_order_project_link', {
        work_order_id: workOrderId
      });
      
    if (linkError) {
      console.error('Error getting work order link:', linkError);
      return false;
    }
    
    // Create an expense for the labor costs
    if (workOrder.actual_hours && workOrder.actual_hours > 0) {
      const laborExpense = {
        project_id: projectId,
        description: `Labor for Work Order: ${workOrder.title}`,
        amount: workOrder.actual_hours * 75, // Assuming $75/hr labor rate
        budget_item_id: linkData?.[0]?.budget_item_id || null,
        expense_date: new Date().toISOString() // Convert Date to ISO string
      };
      
      const { error: laborError } = await supabase
        .from('project_expenses')
        .insert(laborExpense);
        
      if (laborError) {
        console.error('Error inserting labor expense:', laborError);
        return false;
      }
    }
    
    // Create an expense for the materials costs
    if (workOrder.materials_cost && workOrder.materials_cost > 0) {
      const materialsExpense = {
        project_id: projectId,
        description: `Materials for Work Order: ${workOrder.title}`,
        amount: workOrder.materials_cost,
        budget_item_id: linkData?.[0]?.budget_item_id || null,
        expense_date: new Date().toISOString() // Convert Date to ISO string
      };
      
      const { error: materialsError } = await supabase
        .from('project_expenses')
        .insert(materialsExpense);
        
      if (materialsError) {
        console.error('Error inserting materials expense:', materialsError);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in importWorkOrderCostsToProject:', error);
    return false;
  }
};
