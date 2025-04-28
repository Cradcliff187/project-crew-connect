import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves a specific setting value from the database.
 * @param key The key of the setting to retrieve.
 * @param defaultValue The default value to return if the setting is not found.
 * @returns The setting value or the default value.
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();

  if (error || !data) {
    console.warn(`Setting ${key} not found, using default: ${defaultValue}`);
    return defaultValue;
  }

  return data.value;
}

/**
 * Retrieves the default labor cost and bill rates from settings.
 * @returns An object containing the default cost and bill rates.
 */
export async function getDefaultLaborRates() {
  const costRateStr = await getSetting('default_labor_cost_rate', '55');
  const billRateStr = await getSetting('default_labor_bill_rate', '75');

  let costRate = 55;
  let billRate = 75;

  try {
    costRate = parseFloat(costRateStr);
  } catch (e) {
    console.error('Error parsing default_labor_cost_rate, using default 55', e);
  }
  try {
    billRate = parseFloat(billRateStr);
  } catch (e) {
    console.error('Error parsing default_labor_bill_rate, using default 75', e);
  }

  // Ensure rates are valid numbers, default if parsing failed
  if (isNaN(costRate)) costRate = 55;
  if (isNaN(billRate)) billRate = 75;

  return {
    costRate: costRate,
    billRate: billRate,
  };
}

/**
 * Updates a specific setting value in the database.
 * @param key The key of the setting to update.
 * @param value The new value for the setting.
 * @returns True if the update was successful, false otherwise.
 */
export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) {
    console.error(`Error updating setting ${key}:`, error);
    return false;
  }
  return true;
}

/**
 * Retrieves all settings, optionally filtered by category.
 * @param category Optional category to filter settings by.
 * @returns An array of setting objects.
 */
export async function getAllSettings(
  category?: string
): Promise<{ key: string; value: string; description: string | null; category: string | null }[]> {
  let query = supabase.from('settings').select('key, value, description, category');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching settings:', error);
    return [];
  }

  return data || [];
}
