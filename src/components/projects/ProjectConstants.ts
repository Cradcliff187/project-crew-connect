
export const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

// Status transitions based on Supabase validation rules
// Note: These are fallback transitions if the database call fails
// The actual transitions are fetched from the database
// All keys must be lowercase for case-insensitive lookups
export const statusTransitions: Record<string, string[]> = {
  new: ['active', 'cancelled', 'pending'],
  active: ['on_hold', 'cancelled', 'completed'],
  on_hold: ['active', 'completed', 'cancelled'],
  completed: ['active'],
  cancelled: ['active'],
  pending: ['active', 'cancelled'],
};
