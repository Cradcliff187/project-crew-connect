import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const payload = await req.json();
    console.log('Database change webhook received:', payload);

    const { type, table, record, old_record, schema } = payload;

    if (schema !== 'public') {
      return new Response(JSON.stringify({ message: 'Ignored non-public schema' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Handle different table changes
    switch (table) {
      case 'projects':
        await handleProjectChanges(supabase, type, record, old_record);
        break;
      case 'time_entries':
        await handleTimeEntryChanges(supabase, type, record, old_record);
        break;
      case 'expenses':
        await handleExpenseChanges(supabase, type, record, old_record);
        break;
      case 'project_budget_items':
        await handleBudgetItemChanges(supabase, type, record, old_record);
        break;
      case 'change_orders':
        await handleChangeOrderChanges(supabase, type, record, old_record);
        break;
      case 'receipts':
        await handleReceiptChanges(supabase, type, record, old_record);
        break;
      default:
        console.log(`No handler for table: ${table}`);
    }

    return new Response(JSON.stringify({ message: 'Webhook processed successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing database change webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Handle project changes
async function handleProjectChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'UPDATE') {
    // Update derived fields when project changes
    const { error } = await supabase
      .from('projects')
      .update({
        contract_value: calculateContractValue(record),
        updated_at: new Date().toISOString(),
      })
      .eq('projectid', record.projectid);

    if (error) {
      console.error('Error updating project derived fields:', error);
    }
  }
}

// Handle time entry changes
async function handleTimeEntryChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') {
    // Update project budget actual amounts
    const budgetItemId = record?.project_budget_item_id || old_record?.project_budget_item_id;

    if (budgetItemId) {
      await updateBudgetItemActuals(supabase, budgetItemId);
    }

    // Update project total expenses
    const entityId = record?.entity_id || old_record?.entity_id;
    if (entityId && (record?.entity_type === 'project' || old_record?.entity_type === 'project')) {
      await updateProjectExpenses(supabase, entityId);
    }
  }
}

// Handle expense changes
async function handleExpenseChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') {
    // Update budget item actuals
    const budgetItemId = record?.budget_item_id || old_record?.budget_item_id;

    if (budgetItemId) {
      await updateBudgetItemActuals(supabase, budgetItemId);
    }

    // Update project expenses
    const entityId = record?.entity_id || old_record?.entity_id;
    if (entityId && (record?.entity_type === 'project' || old_record?.entity_type === 'project')) {
      await updateProjectExpenses(supabase, entityId);
    }
  }
}

// Handle budget item changes
async function handleBudgetItemChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') {
    const projectId = record?.project_id || old_record?.project_id;
    if (projectId) {
      await updateProjectTotals(supabase, projectId);
    }
  }
}

// Handle change order changes
async function handleChangeOrderChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'UPDATE' && record.status === 'Issued' && old_record?.status !== 'Issued') {
    // Change order approved - update project totals
    if (record.entity_type === 'PROJECT') {
      await updateProjectChangeOrderImpact(
        supabase,
        record.entity_id,
        record.cost_impact,
        record.revenue_impact
      );
    }
  }
}

// Handle receipt changes
async function handleReceiptChanges(supabase: any, type: string, record: any, old_record: any) {
  if (type === 'INSERT') {
    // Trigger OCR processing for new receipts
    console.log('New receipt uploaded, triggering OCR processing:', record.id);
    // Could trigger another Edge Function for OCR processing
  }

  if (
    type === 'UPDATE' &&
    record.approval_status === 'approved' &&
    old_record?.approval_status !== 'approved'
  ) {
    // Receipt approved - create expense entries
    await createExpenseFromReceipt(supabase, record);
  }
}

// Helper functions
async function updateBudgetItemActuals(supabase: any, budgetItemId: string) {
  // Calculate actual amounts from time entries and expenses
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('total_cost')
    .eq('project_budget_item_id', budgetItemId);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('budget_item_id', budgetItemId);

  const totalTimeCost =
    timeEntries?.reduce((sum: number, entry: any) => sum + (entry.total_cost || 0), 0) || 0;
  const totalExpenses =
    expenses?.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0) || 0;
  const actualAmount = totalTimeCost + totalExpenses;

  const { error } = await supabase
    .from('project_budget_items')
    .update({ actual_amount: actualAmount, updated_at: new Date().toISOString() })
    .eq('id', budgetItemId);

  if (error) {
    console.error('Error updating budget item actuals:', error);
  }
}

async function updateProjectExpenses(supabase: any, projectId: string) {
  // Calculate total current expenses for project
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('entity_id', projectId)
    .eq('entity_type', 'project');

  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('total_cost')
    .eq('entity_id', projectId)
    .eq('entity_type', 'project');

  const totalExpenses =
    expenses?.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0) || 0;
  const totalTimeCost =
    timeEntries?.reduce((sum: number, entry: any) => sum + (entry.total_cost || 0), 0) || 0;
  const currentExpenses = totalExpenses + totalTimeCost;

  const { error } = await supabase
    .from('projects')
    .update({ current_expenses: currentExpenses, updated_at: new Date().toISOString() })
    .eq('projectid', projectId);

  if (error) {
    console.error('Error updating project expenses:', error);
  }
}

async function updateProjectTotals(supabase: any, projectId: string) {
  // Calculate total budget from budget items
  const { data: budgetItems } = await supabase
    .from('project_budget_items')
    .select('estimated_amount, actual_amount')
    .eq('project_id', projectId);

  const totalBudget =
    budgetItems?.reduce((sum: number, item: any) => sum + (item.estimated_amount || 0), 0) || 0;
  const actualTotal =
    budgetItems?.reduce((sum: number, item: any) => sum + (item.actual_amount || 0), 0) || 0;

  // Determine budget status
  let budgetStatus = 'on_track';
  if (actualTotal > totalBudget * 1.1) {
    budgetStatus = 'over_budget';
  } else if (actualTotal > totalBudget * 0.9) {
    budgetStatus = 'at_risk';
  }

  const { error } = await supabase
    .from('projects')
    .update({
      total_budget: totalBudget,
      current_expenses: actualTotal,
      budget_status: budgetStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('projectid', projectId);

  if (error) {
    console.error('Error updating project totals:', error);
  }
}

async function updateProjectChangeOrderImpact(
  supabase: any,
  projectId: string,
  costImpact: number,
  revenueImpact: number
) {
  // Get current change order impacts
  const { data: changeOrders } = await supabase
    .from('change_orders')
    .select('cost_impact, revenue_impact')
    .eq('entity_id', projectId)
    .eq('entity_type', 'PROJECT')
    .eq('status', 'Issued');

  const totalCostImpact =
    changeOrders?.reduce((sum: number, co: any) => sum + (co.cost_impact || 0), 0) || 0;
  const totalRevenueImpact =
    changeOrders?.reduce((sum: number, co: any) => sum + (co.revenue_impact || 0), 0) || 0;

  const { error } = await supabase
    .from('projects')
    .update({
      change_order_cost_impact: totalCostImpact,
      change_order_selling_price_impact: totalRevenueImpact,
      updated_at: new Date().toISOString(),
    })
    .eq('projectid', projectId);

  if (error) {
    console.error('Error updating project change order impact:', error);
  }
}

async function createExpenseFromReceipt(supabase: any, receipt: any) {
  // Create expense entry from approved receipt
  const expenseData = {
    entity_type: receipt.project_id ? 'project' : 'work_order',
    entity_id: receipt.project_id || receipt.work_order_id,
    description: receipt.description || `Receipt from ${receipt.merchant}`,
    amount: receipt.amount,
    quantity: 1,
    unit_price: receipt.amount,
    expense_date: receipt.receipt_date || new Date().toISOString(),
    document_id: receipt.id,
    created_by: receipt.created_by,
    category: receipt.cost_category_id ? 'Receipt' : 'General',
    is_billable: receipt.is_billable || true,
    status: 'ACTIVE',
  };

  const { error } = await supabase.from('expenses').insert(expenseData);

  if (error) {
    console.error('Error creating expense from receipt:', error);
  }
}

function calculateContractValue(project: any): number {
  const originalSellingPrice = project.original_selling_price || 0;
  const changeOrderImpact = project.change_order_selling_price_impact || 0;
  return originalSellingPrice + changeOrderImpact;
}
