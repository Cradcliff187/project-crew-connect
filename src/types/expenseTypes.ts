
/**
 * Common expense types used across the application
 * These should match what's stored in the database
 */
export const EXPENSE_TYPES = [
  { id: 'MATERIAL', name: 'Materials' },
  { id: 'LABOR', name: 'Labor' },
  { id: 'EQUIPMENT', name: 'Equipment' },
  { id: 'FUEL', name: 'Fuel' },
  { id: 'TOOLS', name: 'Tools' },
  { id: 'SUPPLIES', name: 'Supplies' },
  { id: 'FOOD', name: 'Food' },
  { id: 'LODGING', name: 'Lodging' },
  { id: 'TRAVEL', name: 'Travel' },
  { id: 'PERMIT', name: 'Permits' },
  { id: 'LICENSE', name: 'Licenses' },
  { id: 'INSURANCE', name: 'Insurance' },
  { id: 'OTHER', name: 'Other' }
];

/**
 * Helper function to get display name from expense type ID
 */
export const getExpenseTypeName = (typeId: string | null): string => {
  if (!typeId) return 'Unknown';
  const found = EXPENSE_TYPES.find(t => t.id === typeId);
  return found ? found.name : typeId.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Helper function to get expense type by ID
 */
export const getExpenseTypeById = (id: string | null) => {
  if (!id) return null;
  return EXPENSE_TYPES.find(type => type.id === id) || null;
};
