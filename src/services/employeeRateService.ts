import { supabase } from '@/integrations/supabase/client';
import { getDefaultLaborRates } from './settingsService';

/**
 * Retrieves the applicable cost and bill rates for a given employee.
 * Falls back to default rates if employee-specific rates are not set or if the employee opts to use defaults.
 * @param employeeId The ID of the employee.
 * @returns An object containing the cost rate, bill rate, and whether default rates were used.
 */
export async function getEmployeeRates(
  employeeId: string
): Promise<{ costRate: number; billRate: number; isDefault: boolean }> {
  const defaultRates = await getDefaultLaborRates();

  if (!employeeId) {
    console.warn('No employeeId provided to getEmployeeRates, returning default rates.');
    return { ...defaultRates, isDefault: true };
  }

  try {
    // Fetch employee-specific rates and default preference
    const { data: employee, error } = await supabase
      .from('employees')
      .select('cost_rate, bill_rate, default_bill_rate')
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      console.error(`Error fetching rates for employee ${employeeId}:`, error.message);
      // Fallback to defaults if employee not found or error occurs
      return { ...defaultRates, isDefault: true };
    }

    // Determine rates based on employee data and defaults
    const useDefaultRates =
      !employee ||
      employee.default_bill_rate ||
      employee.cost_rate === null ||
      employee.bill_rate === null;

    const costRate = useDefaultRates
      ? defaultRates.costRate
      : (employee.cost_rate ?? defaultRates.costRate);
    const billRate = useDefaultRates
      ? defaultRates.billRate
      : (employee.bill_rate ?? defaultRates.billRate);

    return {
      costRate: costRate,
      billRate: billRate,
      isDefault: useDefaultRates,
    };
  } catch (err) {
    console.error(`Unexpected error in getEmployeeRates for employee ${employeeId}:`, err);
    // Fallback to defaults in case of unexpected errors
    return { ...defaultRates, isDefault: true };
  }
}
