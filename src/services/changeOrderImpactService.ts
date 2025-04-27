import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderStatus, ChangeOrderEntityType } from '@/types/changeOrders';
import { toast } from '@/hooks/use-toast';

/**
 * Applies the financial and schedule impacts of a change order to its parent entity (project or work order)
 */
export async function applyChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  try {
    if (changeOrder.status !== 'APPROVED' && changeOrder.status !== 'IMPLEMENTED') {
      console.log('Change order not approved or implemented yet, skipping impact application');
      return true; // Not an error, just no action needed
    }

    // Apply different impacts based on entity type
    if (changeOrder.entity_type === 'PROJECT') {
      return await applyProjectChangeOrderImpact(changeOrder);
    } else if (changeOrder.entity_type === 'WORK_ORDER') {
      // We might need to enhance this if WO COs should also have cost/revenue impact
      return await applyWorkOrderChangeOrderImpact(changeOrder);
    }

    console.warn('Unknown entity type for change order impact:', changeOrder.entity_type);
    return false;
  } catch (error: any) {
    console.error('Error applying change order impact:', error);
    toast({
      title: 'Error',
      description: 'Failed to apply change order impact: ' + error.message,
      variant: 'destructive',
    });
    return false;
  }
}

/**
 * Applies change order impact to a project's budget and schedule
 */
async function applyProjectChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  // Retrieve current project data, including contract_value
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('projectid, total_budget, contract_value, target_end_date')
    .eq('projectid', changeOrder.entity_id)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
    toast({ title: 'Error', description: 'Failed to fetch project data.', variant: 'destructive' });
    return false;
  }
  if (!project) {
    console.error('Project not found for change order impact:', changeOrder.entity_id);
    toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
    return false;
  }

  // Calculate new budget and contract value using cost_impact and revenue_impact
  const currentBudget = Number(project.total_budget || 0);
  const currentContractValue = Number(project.contract_value || 0);
  const costImpact = Number(changeOrder.cost_impact || 0);
  const revenueImpact = Number(changeOrder.revenue_impact || 0);

  const newBudget = currentBudget + costImpact;
  const newContractValue = currentContractValue + revenueImpact;

  let newTargetEndDate = project.target_end_date; // Use target_end_date
  const impactDays = Number(changeOrder.impact_days || 0);
  if (project.target_end_date && impactDays > 0) {
    const currentTargetEndDate = new Date(project.target_end_date);
    currentTargetEndDate.setDate(currentTargetEndDate.getDate() + impactDays);
    newTargetEndDate = currentTargetEndDate.toISOString();
  }

  // Update the project with new budget, contract value, and schedule
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      total_budget: newBudget,
      contract_value: newContractValue,
      target_end_date: newTargetEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq('projectid', changeOrder.entity_id);

  if (updateError) {
    console.error('Error updating project with change order impact:', updateError);
    toast({
      title: 'Error',
      description: 'Failed to update project financials.',
      variant: 'destructive',
    });
    return false;
  }

  // Create budget items from change order items if they exist
  // Adjust estimated_amount based on cost_impact distribution
  const changeOrderItems = changeOrder.items || [];
  if (changeOrderItems.length > 0 && costImpact !== 0) {
    // Only create items if there is a cost impact
    // We need the total selling price of the CO items to calculate proportions
    // Assuming changeOrder.total_amount represents the sum of items' total_price (selling price impact)
    const totalChangeOrderSellingPrice = Number(changeOrder.total_amount || 0);
    const totalCostImpactToDistribute = costImpact;

    const budgetItemsToInsert = changeOrderItems.map(item => {
      let itemCostAmount = 0;
      // Distribute total cost impact proportionally based on item's selling price relative to CO's total selling price
      if (totalChangeOrderSellingPrice > 0 && item.total_price > 0) {
        itemCostAmount =
          (item.total_price / totalChangeOrderSellingPrice) * totalCostImpactToDistribute;
      } else if (changeOrderItems.length > 0) {
        // Fallback: Distribute cost impact evenly if total selling price is zero or invalid
        itemCostAmount = totalCostImpactToDistribute / changeOrderItems.length;
      }

      return {
        project_id: changeOrder.entity_id,
        category: `CO: ${item.item_type || 'General'}`, // Prefix category to indicate source
        description: `${changeOrder.title}: ${item.description}`,
        estimated_amount: itemCostAmount, // Use the calculated cost portion for the budget item estimate
        actual_amount: 0,
        quantity: item.quantity, // Keep quantity if needed for context
        // Store original CO item details for reference if needed
        selling_unit_price: item.unit_price,
        selling_total_price: item.total_price,
        change_order_id: changeOrder.id, // Link budget item to the CO
        is_contingency: false, // CO items are typically not contingency
      };
    });

    const { error: budgetItemError } = await supabase
      .from('project_budget_items')
      .insert(budgetItemsToInsert);

    if (budgetItemError) {
      console.error('Error creating budget items from change order:', budgetItemError);
      toast({
        title: 'Warning',
        description: 'Failed to create all budget items for change order.',
        variant: 'default',
      });
      // Continue execution, as the main project totals were updated
    }
  } else if (costImpact !== 0) {
    // Handle case where there's a cost impact but no items (e.g., a lump sum CO cost adjustment)
    // Create a single generic budget item for the cost impact
    const { error: genericBudgetItemError } = await supabase.from('project_budget_items').insert({
      project_id: changeOrder.entity_id,
      category: 'CO: General Adjustment',
      description: `Cost Impact from Change Order: ${changeOrder.title}`,
      estimated_amount: costImpact,
      actual_amount: 0,
      quantity: 1,
      change_order_id: changeOrder.id,
      is_contingency: false,
    });
    if (genericBudgetItemError) {
      console.error(
        'Error creating generic budget item for CO cost impact:',
        genericBudgetItemError
      );
      toast({
        title: 'Warning',
        description: 'Failed to create budget item for CO cost impact.',
        variant: 'default',
      });
    }
  }

  toast({
    title: 'Change order impact applied',
    description: `Project budget, contract value, and schedule have been updated.`,
  });

  return true;
}

/**
 * Applies change order impact to a work order and propagates to parent project if linked
 * TODO: Review if WO COs should also have financial impact propagation
 */
async function applyWorkOrderChangeOrderImpact(changeOrder: ChangeOrder): Promise<boolean> {
  // First, update the work order itself (primarily schedule impact)
  const { data: workOrder, error: workOrderError } = await supabase
    .from('maintenance_work_orders')
    .select('work_order_id, scheduled_date, due_by_date') // Use due_by_date
    .eq('work_order_id', changeOrder.entity_id)
    .single();

  if (workOrderError) {
    console.error('Error fetching work order:', workOrderError);
    return false;
  }

  // Calculate new due date based on impact days
  let newDueDate = workOrder.due_by_date;
  const impactDays = Number(changeOrder.impact_days || 0);
  if (workOrder.due_by_date && impactDays > 0) {
    const currentDueDate = new Date(workOrder.due_by_date);
    currentDueDate.setDate(currentDueDate.getDate() + impactDays);
    newDueDate = currentDueDate.toISOString();
  }

  // Update the work order schedule
  const { error: updateError } = await supabase
    .from('maintenance_work_orders')
    .update({
      due_by_date: newDueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('work_order_id', changeOrder.entity_id);

  if (updateError) {
    console.error('Error updating work order with change order impact:', updateError);
    return false;
  }

  // Check if work order is linked to a project - Financial impact propagation is currently *not* handled here.
  // If financial impact needs to propagate from WO COs to Projects, this needs enhancement.
  /*
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
      description: `Impact from Work Order change order: ${changeOrder.description || changeOrder.title}`,
      // Ensure cost_impact and revenue_impact are passed if needed
      cost_impact: changeOrder.cost_impact,
      revenue_impact: changeOrder.revenue_impact,
    };
    await applyProjectChangeOrderImpact(projectChangeOrder);
  }
  */

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
      console.warn('Change order not rejected or cancelled, skipping impact reversal');
      return true; // Not an error, just no action needed
    }

    if (changeOrder.entity_type === 'PROJECT') {
      // Fetch the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('projectid, total_budget, contract_value, target_end_date')
        .eq('projectid', changeOrder.entity_id)
        .single();

      if (projectError || !project) {
        console.error('Error fetching project for reversal:', projectError);
        toast({
          title: 'Error',
          description: 'Failed to fetch project for reversal.',
          variant: 'destructive',
        });
        return false;
      }

      // Calculate reversed values
      const currentBudget = Number(project.total_budget || 0);
      const currentContractValue = Number(project.contract_value || 0);
      const costImpact = Number(changeOrder.cost_impact || 0);
      const revenueImpact = Number(changeOrder.revenue_impact || 0);

      const reversedBudget = currentBudget - costImpact;
      const reversedContractValue = currentContractValue - revenueImpact;

      // Schedule impact reversal is currently commented out, but would use target_end_date if implemented

      // Update the project
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          total_budget: reversedBudget,
          contract_value: reversedContractValue,
          // target_end_date: reversedTargetEndDate, // This part is commented out
          updated_at: new Date().toISOString(),
        })
        .eq('projectid', changeOrder.entity_id);

      if (updateError) {
        console.error('Error reverting project impact:', updateError);
        toast({
          title: 'Error',
          description: 'Failed to revert project financial impact.',
          variant: 'destructive',
        });
        return false;
      }

      // Delete budget items created by this change order
      console.log(`Attempting to delete budget items for change order ${changeOrder.id}`);
      const { error: deleteError } = await supabase
        .from('project_budget_items')
        .delete()
        .eq('change_order_id', changeOrder.id);

      if (deleteError) {
        console.error('Error deleting change order budget items:', deleteError);
        toast({
          title: 'Warning',
          description: 'Failed to clean up all associated budget items.',
          variant: 'default',
        });
        // Continue, as main reversal succeeded
      } else {
        console.log(`Successfully deleted budget items linked to change order ${changeOrder.id}`);
      }

      toast({
        title: 'Change order impact reverted',
        description: `Project budget and contract value have been adjusted.`,
      });
    } else if (changeOrder.entity_type === 'WORK_ORDER') {
      // Reversal logic for Work Orders (primarily schedule)
      // Placeholder: Implement if needed, similar structure to project reversal.
      // Currently only reverses schedule impact based on applyWorkOrderChangeOrderImpact
      console.log('Reverting Work Order change order impact (placeholder)...');
      // TODO: Implement schedule reversal if needed.
      toast({
        title: 'Impact Reverted',
        description: 'Work Order schedule impact reversal (placeholder).',
      });
    }

    return true;
  } catch (error: any) {
    console.error('Error reverting change order impact:', error);
    toast({
      title: 'Error',
      description: 'Failed to revert change order impact: ' + error.message,
      variant: 'destructive',
    });
    return false;
  }
}
