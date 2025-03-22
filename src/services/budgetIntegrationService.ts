
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a budget for a project based on an estimate
 */
export const createBudgetFromEstimate = async (projectId: string, estimateId: string): Promise<boolean> => {
  try {
    // Get estimate items
    const { data: estimateItems, error: itemsError } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId);
    
    if (itemsError || !estimateItems || estimateItems.length === 0) {
      console.error('Error fetching estimate items:', itemsError);
      return false;
    }
    
    // Insert budget items based on estimate items
    const budgetItems = estimateItems.map(item => ({
      project_id: projectId,
      category: 'Labor',
      description: item.description,
      estimated_amount: item.total_price,
      actual_amount: 0
    }));
    
    const { error: insertError } = await supabase
      .from('project_budget_items')
      .insert(budgetItems);
    
    if (insertError) {
      console.error('Error inserting budget items:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createBudgetFromEstimate:', error);
    return false;
  }
};

/**
 * Links a work order to a project budget
 */
export const linkWorkOrderToProject = async (
  workOrderId: string, 
  projectId: string, 
  budgetItemId?: string
): Promise<boolean> => {
  try {
    // Call the Supabase function to link the work order to the project
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

/**
 * Imports work order costs to a project budget
 */
export const importWorkOrderCostsToProject = async (
  workOrderId: string, 
  projectId: string
): Promise<boolean> => {
  try {
    // First, get the work order details
    const { data: workOrder, error: woError } = await supabase
      .from('maintenance_work_orders')
      .select('*')
      .eq('work_order_id', workOrderId)
      .single();
    
    if (woError || !workOrder) {
      console.error('Error fetching work order:', woError);
      return false;
    }
    
    // Get or create a budget item for the work order
    const { data: existingBudgetItems, error: biError } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('description', `Work Order: ${workOrder.title}`);
    
    if (biError) {
      console.error('Error fetching budget items:', biError);
      return false;
    }
    
    let budgetItemId: string | undefined;
    
    if (!existingBudgetItems || existingBudgetItems.length === 0) {
      // Create a new budget item
      const { data: newBudgetItem, error: createError } = await supabase
        .from('project_budget_items')
        .insert({
          project_id: projectId,
          category: 'Maintenance',
          description: `Work Order: ${workOrder.title}`,
          estimated_amount: workOrder.total_cost || 0,
          actual_amount: workOrder.total_cost || 0
        })
        .select()
        .single();
      
      if (createError || !newBudgetItem) {
        console.error('Error creating budget item:', createError);
        return false;
      }
      
      budgetItemId = newBudgetItem.id;
    } else {
      // Update the existing budget item
      budgetItemId = existingBudgetItems[0].id;
      
      const { error: updateError } = await supabase
        .from('project_budget_items')
        .update({
          actual_amount: workOrder.total_cost || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetItemId);
      
      if (updateError) {
        console.error('Error updating budget item:', updateError);
        return false;
      }
    }
    
    // Link the work order to the project and budget item
    const linkSuccess = await linkWorkOrderToProject(workOrderId, projectId, budgetItemId);
    
    return linkSuccess;
  } catch (error) {
    console.error('Error in importWorkOrderCostsToProject:', error);
    return false;
  }
};
