import { StatusOption } from '@/components/common/status/UniversalStatusControl';

/**
 * Get available status options based on contact type and current status
 * @param type The contact type (client, customer, supplier, subcontractor, employee)
 * @param currentStatus The current status of the contact
 * @returns Array of status options with value, label, and optional color
 */
export const getStatusOptions = (type: string, currentStatus: string): StatusOption[] => {
  if (!currentStatus) return [];

  if (type === 'client' || type === 'customer') {
    switch (currentStatus) {
      case 'PROSPECT':
        return [{ value: 'ACTIVE', label: 'Convert to Active', color: 'green' }];
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive', color: 'neutral' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate', color: 'green' }];
      default:
        return [];
    }
  } else if (type === 'supplier') {
    switch (currentStatus) {
      case 'POTENTIAL':
        return [{ value: 'APPROVED', label: 'Approve Vendor', color: 'green' }];
      case 'APPROVED':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive', color: 'neutral' }];
      case 'INACTIVE':
        return [{ value: 'APPROVED', label: 'Reactivate', color: 'green' }];
      default:
        return [];
    }
  } else if (type === 'subcontractor') {
    switch (currentStatus) {
      case 'PENDING':
        return [{ value: 'QUALIFIED', label: 'Mark as Qualified', color: 'blue' }];
      case 'QUALIFIED':
        return [{ value: 'ACTIVE', label: 'Convert to Active', color: 'green' }];
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive', color: 'neutral' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate', color: 'green' }];
      default:
        return [];
    }
  } else if (type === 'employee') {
    switch (currentStatus) {
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive', color: 'neutral' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate', color: 'green' }];
      default:
        return [];
    }
  }

  return [];
};
