import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Function to create a budget item
export const createBudgetItem = async (
  projectId: string,
  category: string,
  description: string,
  estimatedAmount: number
): Promise<Database['public']['Tables']['project_budget_items']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('project_budget_items')
      .insert([
        {
          project_id: projectId,
          category: category,
          description: description,
          estimated_amount: estimatedAmount,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating budget item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating budget item:', error);
    return null;
  }
};

// Function to update a budget item
export const updateBudgetItem = async (
  id: string,
  category: string,
  description: string,
  estimatedAmount: number,
  actualAmount: number | null
): Promise<Database['public']['Tables']['project_budget_items']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('project_budget_items')
      .update({
        category: category,
        description: description,
        estimated_amount: estimatedAmount,
        actual_amount: actualAmount,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating budget item:', error);
    return null;
  }
};

// Function to delete a budget item
export const deleteBudgetItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('project_budget_items').delete().eq('id', id);

    if (error) {
      console.error('Error deleting budget item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return false;
  }
};

// Function to fetch budget items by project ID
export const fetchBudgetItemsByProjectId = async (
  projectId: string
): Promise<Database['public']['Tables']['project_budget_items']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching budget items:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return [];
  }
};

// Function to calculate the total estimated budget for a project
export const calculateTotalEstimatedBudget = async (projectId: string): Promise<number> => {
  try {
    const budgetItems = await fetchBudgetItemsByProjectId(projectId);
    const totalEstimatedBudget = budgetItems.reduce((sum, item) => sum + item.estimated_amount, 0);
    return totalEstimatedBudget;
  } catch (error) {
    console.error('Error calculating total estimated budget:', error);
    return 0;
  }
};

// Function to calculate the total actual expenses for a project
export const calculateTotalActualExpenses = async (projectId: string): Promise<number> => {
  try {
    const budgetItems = await fetchBudgetItemsByProjectId(projectId);
    const totalActualExpenses = budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
    return totalActualExpenses;
  } catch (error) {
    console.error('Error calculating total actual expenses:', error);
    return 0;
  }
};

// Function to fetch a single budget item by ID
export const fetchBudgetItemById = async (
  id: string
): Promise<Database['public']['Tables']['project_budget_items']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('project_budget_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching budget item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching budget item:', error);
    return null;
  }
};

// Function to create budget items from an estimate
export const createBudgetFromEstimate = async (projectId: string, estimateId: string): Promise<boolean> => {
  try {
    // Fetch estimate items
    const { data: estimateItems, error: estimateItemsError } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId);

    if (estimateItemsError) {
      console.error('Error fetching estimate items:', estimateItemsError);
      return false;
    }

    if (!estimateItems || estimateItems.length === 0) {
      console.log('No estimate items found for estimate ID:', estimateId);
      return true; // Consider it a success if there are no items to create
    }

    // Create budget items for each estimate item
    for (const item of estimateItems) {
      const { error: createError } = await supabase
        .from('project_budget_items')
        .insert([
          {
            project_id: projectId,
            category: 'Materials', // Or map from estimate item if categories exist
            description: item.description,
            estimated_amount: item.total_price,
          },
        ]);

      if (createError) {
        console.error('Error creating budget item from estimate item:', createError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating budget items from estimate:', error);
    return false;
  }
};

// Function to link a work order to a project
export const linkWorkOrderToProject = async (workOrderId: string, projectId: string, budgetItemId: string | null): Promise<boolean> => {
  try {
    // Call the RPC function
    const { data, error } = await supabase.rpc('link_work_order_to_project', {
      p_work_order_id: workOrderId,
      p_project_id: projectId,
      p_budget_item_id: budgetItemId,
    });
    
    if (error) {
      console.error('Error linking work order to project:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in linkWorkOrderToProject:', error);
    return false;
  }
};

// Function to get project ID linked to a work order
const getProjectIdFromWorkOrder = async (workOrderId: string): Promise<{ projectId: string, budgetItemId: string | null } | null> => {
  try {
    const { data, error } = await supabase.rpc('get_work_order_project_link', {
      work_order_id: workOrderId
    });
    
    if (error) {
      console.error('Error getting project link:', error);
      return null;
    }
    
    // Check if data exists and has the expected format
    if (data && Array.isArray(data) && data.length > 0) {
      // Extract the first item from the array and access properties correctly
      const linkData = data[0];
      return {
        projectId: linkData.project_id,
        budgetItemId: linkData.budget_item_id || null
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getProjectIdFromWorkOrder:', error);
    return null;
  }
};

// Function to fetch project and budget item linked to a work order
export const fetchProjectAndBudgetItemLinkedToWorkOrder = async (workOrderId: string): Promise<{ projectId: string | null, budgetItemId: string | null } | null> => {
  try {
    const projectLink = await getProjectIdFromWorkOrder(workOrderId);
    
    if (!projectLink) {
      console.log('No project link found for work order ID:', workOrderId);
      return { projectId: null, budgetItemId: null };
    }
    
    return {
      projectId: projectLink.projectId,
      budgetItemId: projectLink.budgetItemId
    };
  } catch (error) {
    console.error('Error fetching project and budget item linked to work order:', error);
    return { projectId: null, budgetItemId: null };
  }
};
