
import { supabase } from '@/integrations/supabase/client';

export function useExpenseService() {
  const createExpenseEntries = async (
    timeEntryId: string,
    entityType: 'work_order' | 'project',
    entityId: string,
    hoursWorked: number,
    hourlyRate: number | null,
    hasReceipts: boolean
  ) => {
    try {
      // Only create labor expenses if there are hours worked
      if (hoursWorked > 0) {
        const rate = hourlyRate || 75; // Default to $75/hour if no employee rate
        const totalAmount = hoursWorked * rate;
        
        const { error: laborExpenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: entityType.toUpperCase(),
            entity_id: entityId,
            description: `Labor: ${hoursWorked} hours`,
            expense_type: 'LABOR',
            amount: totalAmount,
            time_entry_id: timeEntryId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: hoursWorked,
            unit_price: rate,
            vendor_id: null,
            expense_date: new Date().toISOString()
          });
          
        if (laborExpenseError) {
          console.error(`Error creating labor expense for ${entityType}:`, laborExpenseError);
        }
      }
    } catch (error) {
      console.error('Error in expense creation:', error);
    }
  };

  return {
    createExpenseEntries
  };
}
