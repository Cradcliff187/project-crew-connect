
/**
 * Format a date or return 'N/A' if null
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  } catch (error) {
    return 'Invalid date';
  }
};
