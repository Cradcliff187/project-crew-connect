// deno-lint-ignore-file no-explicit-any

/// <reference lib="deno.ns" />

// Declare minimal global Deno to satisfy TypeScript in non-Deno tooling

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Edge Function: expense_update
// Processes INSERT/UPDATE/DELETE events on `expenses` table and recalculates roll-ups.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.4';
import { corsHeaders } from './_shared/cors.ts';

// Environment variables injected by Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const { type, old, record } = payload as {
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      table: string;
      record: any;
      old: any;
    };

    // Only handle expenses table changes
    if (payload.table !== 'expenses') {
      return new Response('ignored', { headers: corsHeaders });
    }

    const expense = record as any;

    switch (expense.expense_type) {
      case 'LABOR':
      case 'TIME': // alias
        await handleLaborExpense(expense, type);
        break;
      case 'CHANGE_ORDER':
        await handleChangeOrderExpense(expense, type);
        break;
      default:
        // No-op for other expense types
        break;
    }

    return new Response('done', { headers: corsHeaders });
  } catch (err) {
    console.error('expense_update error', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function handleLaborExpense(expense: any, eventType: string) {
  // Recompute project current_expenses
  if (expense.entity_type === 'PROJECT') {
    await supabase.rpc('update_project_current_expenses', { p_project_id: expense.entity_id });
  }

  // If tied to budget item, update that item actuals
  if (expense.budget_item_id) {
    await supabase.rpc('update_budget_item_actuals', { p_budget_item_id: expense.budget_item_id });
  }
}

async function handleChangeOrderExpense(expense: any, eventType: string) {
  // For expenses linked to change orders, we may need to recalc CO totals (future implementation)
  // Placeholder: just refresh project totals
  if (expense.entity_type === 'PROJECT') {
    await supabase.rpc('update_project_current_expenses', { p_project_id: expense.entity_id });
  }
}
