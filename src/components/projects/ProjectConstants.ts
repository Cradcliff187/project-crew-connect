
export const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

// Status transitions based on Supabase validation rules
export const statusTransitions: Record<string, string[]> = {
  new: ['active', 'cancelled'],
  active: ['on_hold', 'cancelled'],
  on_hold: ['active', 'completed', 'cancelled'],
  completed: ['active'],
  cancelled: ['active'],
  pending: ['active', 'cancelled'],
};
