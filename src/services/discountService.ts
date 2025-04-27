import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types'; // Assuming types are here

export type Discount = Database['public']['Tables']['discounts']['Row'];

/**
 * Fetches all discounts associated with a specific project.
 * @param projectId The ID of the project.
 * @returns An array of Discount objects.
 */
export async function getProjectDiscounts(projectId: string): Promise<Discount[]> {
  if (!projectId) {
    console.error('getProjectDiscounts: projectId is required');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('project_id', projectId)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching project discounts:', error);
    toast({
      title: 'Error',
      description: 'Could not load project discounts.',
      variant: 'destructive',
    });
    return [];
  }
}

/**
 * Adds a new discount for a project.
 * @param projectId The ID of the project.
 * @param amount The discount amount.
 * @param description Optional description for the discount.
 * @returns The newly created Discount object or null if failed.
 */
export async function addDiscount(
  projectId: string,
  amount: number,
  description?: string
): Promise<Discount | null> {
  if (!projectId || amount <= 0) {
    console.error('addDiscount: Invalid projectId or amount');
    toast({
      title: 'Error',
      description: 'Invalid discount details provided.',
      variant: 'destructive',
    });
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('discounts')
      .insert({
        project_id: projectId,
        amount: amount,
        description: description,
      })
      .select()
      .single();

    if (error) throw error;

    toast({ title: 'Success', description: 'Discount added successfully.' });
    return data;
  } catch (error: any) {
    console.error('Error adding discount:', error);
    toast({
      title: 'Error',
      description: 'Could not add discount: ' + error.message,
      variant: 'destructive',
    });
    return null;
  }
}

/**
 * Deletes a specific discount.
 * @param discountId The ID of the discount to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteDiscount(discountId: string): Promise<boolean> {
  if (!discountId) {
    console.error('deleteDiscount: discountId is required');
    return false;
  }

  try {
    const { error } = await supabase.from('discounts').delete().eq('id', discountId);

    if (error) throw error;

    toast({ title: 'Success', description: 'Discount deleted.' });
    return true;
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    toast({
      title: 'Error',
      description: 'Could not delete discount: ' + error.message,
      variant: 'destructive',
    });
    return false;
  }
}

/**
 * Calculates the total sum of discounts for a project.
 * @param projectId The ID of the project.
 * @returns The total discount amount.
 */
export async function calculateTotalDiscounts(projectId: string): Promise<number> {
  if (!projectId) {
    console.error('calculateTotalDiscounts: projectId is required');
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('amount')
      .eq('project_id', projectId);

    if (error) throw error;

    return (data || []).reduce((sum, discount) => sum + (discount.amount || 0), 0);
  } catch (error: any) {
    console.error('Error calculating total discounts:', error);
    // Don't toast here as it might be called frequently for display
    return 0;
  }
}
