import { Subcontractor } from './types'; // Or from the generated types if preferred directly

/**
 * Gets a display name for a subcontractor, preferring contact_name,
 * then company_name, and finally a default placeholder.
 *
 * @param sub - The subcontractor object.
 * @returns The display name string.
 */
export const getSubcontractorDisplayName = (
  sub: Partial<Pick<Subcontractor, 'company_name' | 'contact_name'>> | null | undefined
): string => {
  if (!sub) {
    return 'Unnamed Subcontractor';
  }
  return sub.contact_name || sub.company_name || 'Unnamed Subcontractor';
};
