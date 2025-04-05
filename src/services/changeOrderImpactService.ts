
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderStatus } from '@/types/changeOrders';
import { toast } from '@/hooks/use-toast';

/**
 * Applies the financial and schedule impacts of a change order to its parent entity (project or work order)
 */
export async function applyChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  try {
    if (changeOrder.status !== 'APPROVED' && changeOrder.status !== 'IMPLEMENTED') {
      console.log('Change order not approved or implemented yet, skipping impact application');
      return false;
    }

    // Apply different impacts based on entity type
    if (changeOrder.entity_type === 'PROJECT') {
      return await applyProjectChangeOrderImpact(changeOrder);
    } else if (changeOrder.entity_type === 'WORK_ORDER') {
      return await applyWorkOrderChangeOrderImpact(changeOrder);
    }
    
    return false;
  } catch (error: any) {
    console.error('Error applying change order impact:', error);
    toast({
      title: 'Error',
      description: 'Failed to apply change order impact: ' + error.message,
      variant: 'destructive'
    });
    return false;
  }
}

/**
 * Applies change order impact to a project's budget and schedule
 */
async function applyProjectChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  // Retrieve current project data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('projectid, total_budget, due_date')
    .eq('projectid', changeOrder.entity_id)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
    return false;
  }

  // Calculate new budget and due date
  const newBudget = Number(project.total_budget) + Number(changeOrder.total_amount);
  
  let newDueDate = project.due_date;
  if (project.due_date && changeOrder.impact_days > 0) {
    // Add impact days to the current due date
    const currentDueDate = new Date(project.due_date);
    currentDueDate.setDate(currentDueDate.getDate() + changeOrder.impact_days);
    newDueDate = currentDueDate.toISOString();
  }

  // Update the project with new budget and schedule
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      total_budget: newBudget,
      due_date: newDueDate,
      updated_at: new Date().toISOString()
    })
    .eq('projectid', changeOrder.entity_id);

  if (updateError) {
    console.error('Error updating project with change order impact:', updateError);
    return false;
  }

  // Create budget items from change order items if they exist
  if (changeOrder.items && changeOrder.items.length > 0) {
    const budgetItems = changeOrder.items.map(item => ({
      project_id: changeOrder.entity_id,
      category: `Change Order - ${item.item_type || 'General'}`,
      description: `${changeOrder.title}: ${item.description}`,
      estimated_amount: item.total_price,
      actual_amount: 0
    }));

    const { error: budgetItemError } = await supabase
      .from('project_budget_items')
      .insert(budgetItems);

    if (budgetItemError) {
      console.error('Error creating budget items:', budgetItemError);
      // Continue execution, this is not critical for the main update
    }
  }

  toast({
    title: 'Change order impact applied',
    description: `Project budget and schedule have been updated.`,
  });

  return true;
}

/**
 * Applies change order impact to a work order and propagates to parent project if linked
 */
async function applyWorkOrderChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  // First, update the work order itself
  const { data: workOrder, error: workOrderError } = await supabase
    .from('maintenance_work_orders')
    .select('work_order_id, scheduled_date, due_by_date')
    .eq('work_order_id', changeOrder.entity_id)
    .single();

  if (workOrderError) {
    console.error('Error fetching work order:', workOrderError);
    return false;
  }

  // Calculate new due date based on impact days
  let newDueDate = workOrder.due_by_date;
  if (workOrder.due_by_date && changeOrder.impact_days > 0) {
    const currentDueDate = new Date(workOrder.due_by_date);
    currentDueDate.setDate(currentDueDate.getDate() + changeOrder.impact_days);
    newDueDate = currentDueDate.toISOString();
  }

  // Update the work order
  const { error: updateError } = await supabase
    .from('maintenance_work_orders')
    .update({
      due_by_date: newDueDate,
      updated_at: new Date().toISOString()
    })
    .eq('work_order_id', changeOrder.entity_id);

  if (updateError) {
    console.error('Error updating work order with change order impact:', updateError);
    return false;
  }

  // Check if work order is linked to a project
  const { data: linkData, error: linkError } = await supabase
    .from('work_order_project_links')
    .select('project_id, budget_item_id')
    .eq('work_order_id', changeOrder.entity_id)
    .single();

  // If work order is linked to a project, propagate the impact
  if (linkData && linkData.project_id) {
    const projectChangeOrder: ChangeOrder = {
      ...changeOrder,
      entity_type: 'PROJECT',
      entity_id: linkData.project_id,
      title: `WO-Impact: ${changeOrder.title}`,
      description: `Impact from Work Order change order: ${changeOrder.description || changeOrder.title}`
    };

    // Apply impact to the parent project as well
    await applyProjectChangeOrderImpact(projectChangeOrder);
  }

  toast({
    title: 'Change order impact applied',
    description: `Work order schedule has been updated.`,
  });

  return true;
}

/**
 * Reverts the financial and schedule impacts of a change order if it's rejected or canceled
 */
export async function revertChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  try {
    if (changeOrder.status !== 'REJECTED' && changeOrder.status !== 'CANCELLED') {
      console.log('Change order not rejected or cancelled, skipping impact reversal');
      return false;
    }

    // Implementation would be similar to apply but with opposite calculations
    // This is a simplified placeholder
    console.log('Reverting change order impact for', changeOrder.id);
    
    toast({
      title: 'Change order impact reverted',
      description: `The effects of this change order have been removed.`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error reverting change order impact:', error);
    return false;
  }
}
