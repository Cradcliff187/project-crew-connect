
/**
 * Utility function to get the appropriate color class for a status badge
 * @param status The status string to map to a color class
 * @returns A string containing the Tailwind CSS classes for the badge
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get the status display name from a status code
 * @param status The status code/string
 * @returns Formatted status string for display
 */
export const getStatusDisplay = (status: string): string => {
  if (!status) return 'Unknown';
  
  // Default: capitalize first letter of each word
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
