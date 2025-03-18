
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Service for integrating various cost sources into the project budget system
 */
export const budgetIntegrationService = {
  /**
   * Creates initial budget items from an estimate when converting to a project
   */
  async createBudgetFromEstimate(projectId: string, estimateId: string): Promise<boolean> {
    try {
      // Fetch estimate items
      const { data: estimateItems, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('estimate_id', estimateId);
      
      if (itemsError) throw itemsError;
      if (!estimateItems || estimateItems.length === 0) return false;
      
      // Get estimate details for contingency
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('estimateamount, contingency_percentage, contingencyamount')
        .eq('estimateid', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Group similar items by category
      const categorizedItems: Record<string, { 
        description: string[],
        amount: number 
      }> = {};
      
      // Default categories mapping based on item description keywords
      const categoryMappings: Record<string, string[]> = {
        'materials': ['material', 'supplies', 'parts', 'equipment'],
        'labor': ['labor', 'work', 'hours', 'installation'],
        'subcontractors': ['sub', 'contractor', 'subcontractor'],
        'permits': ['permit', 'fee', 'license', 'inspection'],
        'overhead': ['overhead', 'admin', 'administrative'],
      };
      
      // Categorize each estimate item
      estimateItems.forEach(item => {
        let category = 'other'; // Default category
        
        // Try to determine category based on description keywords
        for (const [cat, keywords] of Object.entries(categoryMappings)) {
          if (keywords.some(keyword => 
            item.description.toLowerCase().includes(keyword)
          )) {
            category = cat;
            break;
          }
        }
        
        // Add to categorized items
        if (!categorizedItems[category]) {
          categorizedItems[category] = {
            description: [],
            amount: 0
          };
        }
        
        categorizedItems[category].description.push(item.description);
        categorizedItems[category].amount += item.total_price;
      });
      
      // Add contingency if available
      if (estimate?.contingencyamount && estimate.contingencyamount > 0) {
        categorizedItems['contingency'] = {
          description: [`Contingency (${estimate.contingency_percentage}%)`],
          amount: estimate.contingencyamount
        };
      }
      
      // Create budget items for each category
      const budgetItems = Object.entries(categorizedItems).map(([category, data]) => ({
        project_id: projectId,
        category,
        description: data.description.join(', '),
        estimated_amount: data.amount,
        actual_amount: 0
      }));
      
      // Insert budget items
      const { error: insertError } = await supabase
        .from('project_budget_items')
        .insert(budgetItems);
      
      if (insertError) throw insertError;
      
      // Set initial project budget based on estimate amount
      if (estimate?.estimateamount) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ total_budget: estimate.estimateamount })
          .eq('projectid', projectId);
          
        if (updateError) throw updateError;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating budget from estimate:', error);
      return false;
    }
  },
  
  /**
   * Links work order costs to project budget items
   */
  async linkWorkOrderToProjectBudget(
    workOrderId: string, 
    projectId: string, 
    budgetItemId?: string
  ): Promise<boolean> {
    try {
      // First, check if this work order is already linked to a project
      const { data: existingLink, error: checkError } = await supabase
        .from('work_order_project_links')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's fine, but other errors are problems
        throw checkError;
      }
      
      // If a link exists, update it
      if (existingLink) {
        const { error: updateError } = await supabase
          .from('work_order_project_links')
          .update({ 
            project_id: projectId,
            budget_item_id: budgetItemId || null
          })
          .eq('id', existingLink.id);
          
        if (updateError) throw updateError;
      } else {
        // Create a new link
        const { error: insertError } = await supabase
          .from('work_order_project_links')
          .insert({
            work_order_id: workOrderId,
            project_id: projectId,
            budget_item_id: budgetItemId || null
          });
          
        if (insertError) throw insertError;
      }
      
      // Now update the work order with the project reference
      const { error: woUpdateError } = await supabase
        .from('maintenance_work_orders')
        .update({ project_id: projectId })
        .eq('work_order_id', workOrderId);
      
      if (woUpdateError) throw woUpdateError;
      
      return true;
    } catch (error) {
      console.error('Error linking work order to project budget:', error);
      return false;
    }
  },
  
  /**
   * Imports work order costs into project expenses
   */
  async importWorkOrderCostsToProject(workOrderId: string, projectId: string): Promise<boolean> {
    try {
      // Get work order details with costs
      const { data: workOrder, error: woError } = await supabase
        .from('maintenance_work_orders')
        .select('work_order_id, title, materials_cost, total_cost')
        .eq('work_order_id', workOrderId)
        .single();
      
      if (woError) throw woError;
      if (!workOrder) return false;
      
      // Get the work order's linked budget item, if any
      const { data: link, error: linkError } = await supabase
        .from('work_order_project_links')
        .select('budget_item_id')
        .eq('work_order_id', workOrderId)
        .eq('project_id', projectId)
        .single();
      
      if (linkError && linkError.code !== 'PGRST116') throw linkError;
      
      // Get budget items for this project to find appropriate categories
      const { data: budgetItems, error: biError } = await supabase
        .from('project_budget_items')
        .select('id, category')
        .eq('project_id', projectId);
      
      if (biError) throw biError;
      
      // Find or create appropriate budget items for materials and labor
      let materialsBudgetItemId = link?.budget_item_id || null;
      let laborBudgetItemId = null;
      
      if (budgetItems && budgetItems.length > 0) {
        // If we don't have a specific linked budget item, try to find appropriate categories
        if (!materialsBudgetItemId) {
          const materialsItem = budgetItems.find(item => item.category === 'materials');
          if (materialsItem) materialsBudgetItemId = materialsItem.id;
        }
        
        const laborItem = budgetItems.find(item => item.category === 'labor');
        if (laborItem) laborBudgetItemId = laborItem.id;
      }
      
      // If budget items don't exist yet, create them
      if (!materialsBudgetItemId && workOrder.materials_cost > 0) {
        const { data: newItem, error: createError } = await supabase
          .from('project_budget_items')
          .insert({
            project_id: projectId,
            category: 'materials',
            description: 'Materials from work orders',
            estimated_amount: workOrder.materials_cost,
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        materialsBudgetItemId = newItem.id;
      }
      
      if (!laborBudgetItemId && (workOrder.total_cost - workOrder.materials_cost) > 0) {
        const { data: newItem, error: createError } = await supabase
          .from('project_budget_items')
          .insert({
            project_id: projectId,
            category: 'labor',
            description: 'Labor from work orders',
            estimated_amount: workOrder.total_cost - workOrder.materials_cost,
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        laborBudgetItemId = newItem.id;
      }
      
      // Create expense records
      const expenses = [];
      
      // Add materials expense if there is a cost
      if (workOrder.materials_cost > 0) {
        expenses.push({
          project_id: projectId,
          budget_item_id: materialsBudgetItemId,
          description: `Materials for work order: ${workOrder.title}`,
          amount: workOrder.materials_cost,
          expense_date: new Date().toISOString()
        });
      }
      
      // Add labor expense if there is a cost
      const laborCost = workOrder.total_cost - workOrder.materials_cost;
      if (laborCost > 0) {
        expenses.push({
          project_id: projectId,
          budget_item_id: laborBudgetItemId,
          description: `Labor for work order: ${workOrder.title}`,
          amount: laborCost,
          expense_date: new Date().toISOString()
        });
      }
      
      // Insert expenses
      if (expenses.length > 0) {
        const { error: expenseError } = await supabase
          .from('project_expenses')
          .insert(expenses);
        
        if (expenseError) throw expenseError;
      }
      
      return true;
    } catch (error) {
      console.error('Error importing work order costs to project:', error);
      return false;
    }
  },
  
  /**
   * Retrieves total costs by category for a project
   */
  async getProjectCostsByCategory(projectId: string): Promise<Record<string, number>> {
    try {
      // Fetch all expenses for this project
      const { data: expenses, error: expenseError } = await supabase
        .from('project_expenses')
        .select(`
          amount, 
          budget_item_id,
          budget_item:budget_item_id(category)
        `)
        .eq('project_id', projectId);
      
      if (expenseError) throw expenseError;
      
      // Group expenses by category
      const categorizedCosts: Record<string, number> = {};
      
      (expenses || []).forEach(expense => {
        const category = expense.budget_item?.category || 'uncategorized';
        
        if (!categorizedCosts[category]) {
          categorizedCosts[category] = 0;
        }
        
        categorizedCosts[category] += expense.amount;
      });
      
      return categorizedCosts;
    } catch (error) {
      console.error('Error getting project costs by category:', error);
      return {};
    }
  }
};
